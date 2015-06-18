
const PATH = require("path");
const FS = require("fs-extra");
const EXPRESS = require("express");
const SEND = require("send");
const HTTP = require("http");

const MORGAN = require("morgan");
const BODY_PARSER = require('body-parser');
const COOKIE_PARSER = require("cookie-parser");
const SESSION = require('express-session');
const SESSION_FILESTORE = require('session-file-store')(SESSION);
const PASSPORT = require("passport");
const PASSPORT_GITHUB = require("passport-github");
const NUNJUCKS = require("nunjucks");


require('org.pinf.genesis.lib').forModule(require, module, function (API, exports) {

	return API.Q.denodeify(function (callback) {

		var keypair = API.FORGE.pki.rsa.generateKeyPair({
			bits: 1024,
			e: 0x10001
		});

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


		var app = EXPRESS();

		app.get(/^\/favicon\.(ico|png)$/, function(req, res, next) {
		    res.writeHead(404);
		    return res.end();
		});

		app.use(MORGAN('combined'));
		app.use(COOKIE_PARSER());
		app.use(BODY_PARSER());

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

	    NUNJUCKS.configure(PATH.join(__dirname, 'www'), {
	        watch: true,
	        autoescape: true,
	        express: app
	    });


	    var sessionBasePath = API.PATH.join(process.env.PIO_SERVICE_CACHE_BASEPATH, "sessions");
	    if (!FS.existsSync(sessionBasePath)) {
	    	FS.mkdirsSync(sessionBasePath);
	    }

		app.use(SESSION({
		    store: new SESSION_FILESTORE({
		    	path: sessionBasePath
		    }),
		    secret: API.config.session.secret
		}));

        app.use(passport.initialize());
        app.use(passport.session());


	    function render(req, res, view) {

console.log("req.session", req.session);

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

	    var status = {};

	    app.get(/^\/status$/, function(req, res, next) {


	    	return res.end(JSON.stringify({}, null, 4));
	    });

		app.get(/^\/pubkey$/, function(req, res, next) {
			return res.end(API.FORGE.pki.publicKeyToPem(keypair.publicKey));
		});


		function login (req, res, next) {

	        function fail (reason) {
	        	console.log("Fail login due to: " + reason);
	        	res.writeHead(302, {
	                "Location": "/fail"
	            });
	            return res.end();
	        }

	        if (req.session.authorized) {
	            req.session.authorized = {};
	        }
	        req.session.vct = null;

	        var requested = null;

	        if (req.query.invite) {

		        try {
					if (!(requested = API.JWT.verify(
						req.query.invite,
						req.query.code
					))) return fail("error verifying JWT");
				} catch (err) {
					return fail(err.message);
				}

console.log("DECRYPTED invite!!!!!", requested);


	        } else
	        if (req.query.request) {

console.log("req.query.request", decodeURIComponent(req.query.request));

/*
JSON.stringify({
					repository: "OUR REPO",
					branch: "OUR BRANCH",
					rootSecretHash: "OUR SECRET HASH", 
					publicKeyFingerprint: "OUR FINGERPRINT"
				})
*/

				var request = keypair.publicKey.encrypt("secret!");

				var decrypted = keypair.privateKey.decrypt(request);

console.log("HEX!!", decrypted);


/*
				var request = API.FORGE.util.encode64(publicKey.encrypt(FORGE.util.hexToBytes(JSON.stringify({
					repository: "OUR REPO",
					branch: "OUR BRANCH",
					rootSecretHash: "OUR SECRET HASH", 
					publicKeyFingerprint: "OUR FINGERPRINT"
				}))));


				var decrypted = keypair.privateKey.decrypt(API.FORGE.util.decode64(decodeURIComponent(req.query.request)));

console.log("HEX!!", API.FORGE.util.bytesToHex(decrypted));
*/

/*
		        try {
					if (!(requested = API.JWT.verify(
						req.query.seed,
						req.query.code
					))) return fail("error verifying JWT");
				} catch (err) {
					return fail(err.message);
				}

console.log("DECRYPTED seed!!!!!", requested);
*/
	        }

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

			if (req.body.statusId) {
				// TODO: Record IP
				status[req.body.statusId] = req.session;
console.log("ATTACH STATUS", req);
			}

			res.writeHead(302, {
	            "Location": "/"
	        });
	        return res.end();
		}
		app.get(/^\/login$/, login);
		app.post(/^\/login$/, login);


	    app.get(/^\/login\/github$/, passport.authenticate("github", {
	        failureRedirect: "/fail"
	    }), function(req, res) {
	        if (!req.session.passport.user || !req.session.passport.user.id) {
	            res.writeHead(302, {
	                "Location": "/fail"
	            });
	            return res.end();
	        }
	        if (!req.session.authorized) {
	            req.session.authorized = {};
	        }
	        req.session.authorized.github = req.session.passport.user;
	        delete req.session.passport;
	        res.writeHead(302, {
	            "Location": "/"
	        });
	        return res.end();
	    });
	    app.get(/^\/logout$/, function(req, res) {
	        if (req.session.authorized) {
	            req.session.authorized = {};
	        }
	        req.session.vct = null;
	        res.writeHead(302, {
	            "Location": "/"
	        });
	        return res.end();
	    });

		app.get(/^\/lib\/((?:semantic-ui-css\/).+)$/, function(req, res, next) {
	        return SEND(req, req.params[0])
	            .root(PATH.join(__dirname, "node_modules"))
	            .on("error", next)
	            .on('directory', next)
	            .pipe(res);
	    });

	    app.get(/^\/(.*)$/, function(req, res) {
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


		HTTP.createServer(app).listen(API.config.port, API.config.bind);

		console.log("Server listening at: http://" + API.config.bind + ":" + API.config.port);

		return callback(null);
	})();

});

