
require('org.pinf.genesis.lib/lib/api').forModule(require, module, function (API, exports) {

	const PATH = require("path");
	const FS = require("fs-extra");
	const EXPRESS = require("express");
	const SEND = require("send");
	const HTTP = require("http");
	const UUID = require("uuid");

	const MORGAN = require("morgan");
	const BODY_PARSER = require('body-parser');
	const COOKIE_PARSER = require("cookie-parser");
	const SESSION = require('express-session');
	const SESSION_FILESTORE = require('session-file-store')(SESSION);
	const PASSPORT = require("passport");
	const PASSPORT_GITHUB = require("passport-github");
	const NUNJUCKS = require("nunjucks");


	var app = EXPRESS();
	app.get(/^\/favicon\.(ico|png)$/, function(req, res, next) {
	    res.writeHead(200);
	    return res.end("");
	});
	app.use(MORGAN('combined'));




    var keypairs = {};

    function getKeypairForCertificateKey (certificateKey, createIfNotExist) {
    	if (!keypairs[certificateKey]) {
    		if (!createIfNotExist) {
    			throw new Error("No keypair found for certificateKey '" + certificateKey + "'");
    		}
			// One-time generation of keys that should be stored as long
			// as the longest valid client session that needs the certificate.
			// TODO: Update expiry of certificate whenever a new session with expiry is registered.
			// TODO: Pre-generate certificates based on declarations before using them here.
			if (!API.config.session.certificates[certificateKey]) {
				throw new Error("Requested certificateKey '" + certificateKey + "' not declared!");
			}
	    	keypairs[certificateKey] = API.FORGE.pki.rsa.generateKeyPair({
				bits: 1024,
				e: 0x10001
			});
    	}
		return keypairs[certificateKey];
    }

    var backendSessions = {};

    function authenticateBackendRequest (req, res, next) {
    	try {

    		var proof = req.headers['x-session-proof'] || req.query.p;
    		var signature = req.headers['x-session-request-signature'] || req.query.s;

	    	if (!proof) {
	    		throw new Error("'x-session-proof' header nor 'p' query parameter set!");
	    	}
	    	if (!signature) {
	    		throw new Error("'x-session-request-signature' header nor 's' query parameter set!");
	    	}

	    	var session = backendSessions[proof];

	    	if (!session) {
	    		throw new Error("Session for id '" + proof + "' not found!");
	    	}

			var requestSignature = API.JWT.verify(
				signature,
				session.intent.clientSecret + ":" + session.serverSessionProof
			);
			if (!requestSignature) {
				throw new Error("Error decrypting signature!");
			}

			var expectedSignature = API.CRYPTO.createHash('sha1').update(API.CANONICAL_JSON({
				method: req.method,
				path: API.URIJS(req.url).removeSearch(["p", "s"]).toString(),
				data: null
			})).digest('hex');

			if (requestSignature !== expectedSignature) {
				throw new Error("Request signature does not match expected signature!");
			}

			req.backendSession = session;

		} catch (err) {
			console.log("USER SESSION WARNING:", err.message);
			res.writeHead(403);
			return res.end("Forbidden");
		}
		return next();
    }

	app.all(/^\/intent\/(.+)$/, function(req, res, next) {
		if (req.method !== "OPTIONS") return next();
		var keypair = getKeypairForCertificateKey(req.params[0], true);
		return res.end(API.FORGE.pki.publicKeyToPem(keypair.publicKey));
	});

    app.get(/^\/intent$/, authenticateBackendRequest, function(req, res, next) {
    	return res.end(JSON.stringify(req.backendSession.status || {}, null, 4));
    });

	app.delete(/^\/intent$/, authenticateBackendRequest, function(req, res, next) {
		delete backendSessions[req.backendSession.serverSessionProof];
		var nonce = API.UUID.v4();
		return res.end(JSON.stringify({
			nonce: nonce,
    		clientSecretProof: API.CRYPTO.createHash('sha1').update(
				req.backendSession.intent.clientSecret + ":" + req.backendSession.serverSessionProof + ":" + nonce
			).digest('hex')
    	}, null, 4));
	});

	app.post(/^\/intent$/, BODY_PARSER.json(), function(req, res, next) {

		function decryptIntent (keypair, encryptedClientSecret, encryptedIntent) {

			// Decrypt the intent using the client secret
			var sessionIntent = API.JWT.verify(
				encryptedIntent,
				// Decrypt the client secret that was encrypted with our public key
				keypair.privateKey.decrypt(API.FORGE.util.decode64(encryptedClientSecret))
			);
			if (!sessionIntent) {
				throw new Error("Error decrypting sessionIntent!");
			}
			return sessionIntent;
		}

		var session = {};

		try {

			API.ASSERT.equal(typeof req.body.serverCertificateKey, "string", "'serverCertificateKey' must be set!");
			API.ASSERT.equal(typeof req.body.encryptedClientSecret, "string", "'encryptedClientSecret' must be set!");
			API.ASSERT.equal(typeof req.body.encryptedIntent, "string", "'encryptedIntent' must be set!");

			var keypair = getKeypairForCertificateKey(req.body.serverCertificateKey);

			session.intent = decryptIntent(
				keypair,
				req.body.encryptedClientSecret,
				req.body.encryptedIntent
			);

			if (session.intent.serverCertificateKey !== req.body.serverCertificateKey) {
				throw new Error("serverCertificateKey in the session intent payload does not match the one in the session intent envelope")
			}

			// TODO: Respect 'session.intent.serverExpireSession'

			session.serverSessionProof = UUID.v4();

			session.context = API.config.session.certificates[session.intent.serverCertificateKey];

			if (backendSessions[session.serverSessionProof]) {
				throw new Error("Session already exists! This should never happen!");
			}
			backendSessions[session.serverSessionProof] = session;

		} catch (err) {
			console.error(err.stack);
			res.writeHead(403);
			return res.end("Forbidden");
		}

		res.writeHead(200, {
			"Content-Type": "application/json"
		});

		return res.end(JSON.stringify({
			encryptedSession: API.JWT.sign(
				{
					serverSessionProof: session.serverSessionProof
				},
				session.intent.clientSecret,
				{
					expiresInSeconds: 15
				}
			)
		}, null, 4));
	});




	app.use(COOKIE_PARSER());
//	app.use(BODY_PARSER());
	app.use(function (req, res, next) {

		var origin = null;
        if (req.headers.origin) {
            origin = req.headers.origin;
        } else
        if (req.headers.host) {
            origin = [
                (API.config.port === 443) ? "https" : "http",
                "://",
                req.headers.host
            ].join("");
        }
        res.setHeader("Access-Control-Allow-Methods", "GET");
        res.setHeader("Access-Control-Allow-Credentials", "true");
        res.setHeader("Access-Control-Allow-Origin", origin);
        res.setHeader("Access-Control-Allow-Headers", "Content-Type, Cookie");
        if (req.method === "OPTIONS") {
            return res.end();
        }

        return next();
	});




    var sessionBasePath = API.PATH.join(process.env.PIO_SERVICE_CACHE_BASEPATH, "sessions");
    if (!FS.existsSync(sessionBasePath)) {
    	FS.mkdirsSync(sessionBasePath);
    }
	app.use(SESSION({
	    store: new SESSION_FILESTORE({
	    	path: sessionBasePath
	    }),
	    secret: API.config.session.cookieSecret,
	    name: API.CRYPTO.createHash('sha1').update("name-hash-from-secret:" + API.config.session.cookieSecret).digest('hex').substring(0, 7)
	}));




    var passport = new PASSPORT.Passport();
    passport.serializeUser(function(user, done) {
        done(null, user);
    });
    passport.deserializeUser(function(obj, done) {
        done(null, obj);
    });
    passport.use(new PASSPORT_GITHUB.Strategy(API.config.passport.github, function(accessToken, refreshToken, profile, done) {
        return done(null, {                    
            "id": profile.id,
            "email": profile.emails[0].value,
            "username": profile.username,
            "accessToken": accessToken
        });
    }));
    app.use(passport.initialize());
    app.use(passport.session());




    NUNJUCKS.configure(PATH.join(__dirname, "../www"), {
        watch: true,
        autoescape: true,
        express: app
    });
    function render(req, res, view) {

		if (
			!req.session.vct ||
			!req.session.vct.requested
		) {
			view = "fail.htm";
		}

	    function makeInvite (vct) {
	    	if (view !== "index.html") {
	    		return null;
	    	}
	    	if (
	    		!req.session.authorized ||
	    		!req.session.authorized.github
	    	) {
	    		return null;
	    	}
	    	if (
	    		!req.session.vct ||
	    		!req.session.vct.requested ||
	    		!req.session.vct.arrived
	    	) {
	    		return null;
	    	}

	    	var invite = {
	    		code: "" + (Math.floor(Math.random()*9000) + 1000)
	    	};
	    	invite.token = API.JWT.sign(req.session.vct.requested, invite.code, {
	    		expiresInMinutes: 1
	    	});

	    	return invite;
	    }

        return res.render(view, {
            authorized: req.session.authorized || {},
            vct: req.session.vct || null,
            invite: makeInvite(req.session.vct)
        });
    }

	function login (req, res, next) {

        function fail (reason) {
        	console.log("Fail login due to: " + reason);
        	res.writeHead(302, {
                "Location": req.urlPrefix + "/fail"
            });
            return res.end();
        }

		req.session.serverSessionProof = req.backendSession.serverSessionProof;

        if (req.session.authorized) {
            req.session.authorized = {};
        }

        req.session.vct = null;

/*
        if (!requested) return fail("no 'requested'");
		if (!requested.repository) return fail("no 'requested.repository'");
		if (!requested.branch) return fail("no 'requested.branch'");
		if (!requested.rootSecretHash) return fail("no 'requested.rootSecretHash'");
		if (!requested.publicKeyFingerprint) return fail("no 'requested.publicKeyFingerprint'");

		req.session.vct = {
			requested: requested,
			arrived: {
				namespaceUri: requested.repository + ".genesis.virtualcloud.io",
				accessSecretHash: requested.rootSecretHash + "ss"
			}
		};
*/

		req.session.vct = {
			requested: {
				repository: "github.com/goodybag/goodybag-core",
				branch: "master",
				rootSecretHash: "root-secret-hash",
				publicKeyFingerprint: "public-key-fingerprint"
			},
			arrived: {
				namespaceUri: "DERIVED-HASH-ID" + ".genesis.virtualcloud.io",
				accessSecretHash: "SECRET HASH" + "ss"
			}
		};

		res.writeHead(302, {
            "Location": req.urlPrefix + "/"
        });
        return res.end();
	}
	app.get(/^\/login$/, authenticateBackendRequest, login);

	// TODO: Allow posting to init session?
	//	app.post(/^\/login$/, login);


    function authenticateFrontendRequest (req, res, next) {
		try {

			if (!req.session.serverSessionProof) {
				throw new Error("'serverSessionProof' not set in session!");
			}
			if (!backendSessions[req.session.serverSessionProof]) {
				throw new Error("'serverSessionProof' found in session no longer valid. Likely due to server restarting (which times out client sessions)");
			}

		} catch (err) {

			logoutFrontendSession(req.session);

			console.log("USER SESSION WARNING:", err.message);

			res.writeHead(302, {
                "Location": req.urlPrefix + "/fail"
            });
            return res.end();
		}
		return next();
    }

    function logoutFrontendSession (session) {
        if (session.authorized) {
            session.authorized = {};
        }
        session.vct = null;
    }

    app.use(function (req, res, next) {
    	res.once("finish", function () {

			if (!req.session.serverSessionProof) return;

			var backendSession = backendSessions[req.session.serverSessionProof];

			backendSession.status = {
				services: {}
			};
			if (
				req.session &&
				req.session.authorized
			) {
				Object.keys(req.session.authorized).forEach(function (serviceId) {
					backendSession.status.services[serviceId] = req.session.authorized[serviceId];
				});
			}
    	});
    	return next();
    });

    app.get(/^\/login\/github$/, authenticateFrontendRequest, function (req, res, next) {
		return passport.authenticate("github", {
	        failureRedirect: req.urlPrefix + "/fail"
	    })(req, res, next);
    }, function(req, res) {
        if (!req.session.passport.user || !req.session.passport.user.id) {
            res.writeHead(302, {
                "Location": req.urlPrefix + "/fail"
            });
            return res.end();
        }
        if (!req.session.authorized) {
            req.session.authorized = {};
        }
        req.session.authorized.github = req.session.passport.user;
        delete req.session.passport;
        res.writeHead(302, {
            "Location": req.urlPrefix + "/"
        });
        return res.end();
    });
    app.get(/^\/logout$/, authenticateFrontendRequest, function(req, res) {
		logoutFrontendSession(req.session);
        res.writeHead(302, {
            "Location": req.urlPrefix + "/"
        });
        return res.end();
    });

	app.get(/^\/lib\/((?:semantic-ui-css\/).+)$/, function(req, res, next) {
        return SEND(req, req.params[0])
            .root(PATH.join(__dirname, "../node_modules"))
            .on("error", next)
            .on('directory', next)
            .pipe(res);
    });

    app.get(/^\/fail$/, function(req, res) {
		logoutFrontendSession(req.session);
    	return render(req, res, "fail.htm");
    });

    app.get(/^\/(.*\.(?:js|css))$/, function(req, res, next) {
        return SEND(req, req.params[0])
            .root(PATH.join(__dirname, "../www"))
            .on("error", next)
            .on('directory', next)
            .pipe(res);
    });

    app.get(/^\/(.*)$/, authenticateFrontendRequest, function(req, res) {
        var path = req.params[0];
        if (!path || /\/$/.test(req.params[0])) {
            path += "index.html";
        } else
        if (!/\./.test(req.params[0])) {
            path += ".htm";
        }
        if (/\.css$/.test(req.url)) {
            res.setHeader("Content-Type", "text/css");
        }
        return render(req, res, path);
    });


	// Expose a HTTP interface.
	exports["github.com/creationix/stack/0"] = app;

});
