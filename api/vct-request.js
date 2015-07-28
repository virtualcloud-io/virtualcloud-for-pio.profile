
require('org.pinf.genesis.lib').forModule(require, module, function (API, exports) {

	const SPAWN = require("child_process").spawn;

	exports.login = function (request) {

		return API.Q.fcall(function () {

			API.ASSERT.equal(typeof API.config.server.baseUrl, "string");
			API.ASSERT.equal(typeof API.config.server.certificateKey, "string");

			var serverBaseUrl = API.config.server.baseUrl;

			function getEncryptedClientSecret (session) {
				return API.FORGE.util.encode64(
					session.serverPublicKey.encrypt(
						session.clientSecret
					)
				);
			}

			function encryptMessage (session, message) {
				return API.JWT.sign(message, session.clientSecret, {
					expiresInSeconds: 15
				});
			}

			function getSession (intent) {

				function getPublicKey () {
					return API.Q.denodeify(function (callback) {
						return API.REQUEST({
							method: "OPTIONS",
							uri: serverBaseUrl + "/intent/" + API.config.server.certificateKey
						}, function (err, response, publicKeyPem) {
							if (err) return callback(err);
							if (response.statusCode !== 200) {
								return callback(new Error("Did not get status 200"));
							}
							return callback(null, API.FORGE.pki.publicKeyFromPem(publicKeyPem));
						});
					})();
				}

				function expressIntent (sessionIntent) {
					return API.Q.denodeify(function (callback) {
						return API.REQUEST({
							method: 'POST',
							uri: serverBaseUrl + "/intent",
							json: {
								serverCertificateKey: API.config.server.certificateKey,
								encryptedClientSecret: getEncryptedClientSecret(sessionIntent),
								encryptedIntent: encryptMessage(sessionIntent, sessionIntent)
							}
						}, function (err, response, body) {
							if (err) return callback(err);
							if (response.statusCode !== 200) {
								return callback(new Error("Did not get status 200"));
							}
							return callback(null, body);
						});
					})();
				}

				// First we get the public key of the server so we
				// can securely send it a secret to decrypt our messages.
				return getPublicKey().then(function (serverPublicKey) {

					var sessionIntent = {
						serverCertificateKey: API.config.server.certificateKey,
						serverPublicKey: serverPublicKey,
						// Our secret that we will use to encrypt data and
						// the server will use to decrypt data.
						clientSecret: API.UUID.v4(),
						// The purpose of our session which determines the default
						// context from which to resolve scopes.
						clientIntent: intent,
						// How long a record of this session/intent should be kept
						// on the server after which the server can safely garbage collect. 
						serverExpireSession: (60 * 5), // 5 minutes
						services: {
							virtualcloud: {
								scopes: {
									"all": true
								},
								context: {
									repository: "OUR REPO",
									branch: "OUR BRANCH",
									rootSecretHash: "OUR SECRET HASH", 
									publicKeyFingerprint: "OUR FINGERPRINT"
								}
							},
							github: {
								scopes: {
									"user": true
								}
							}
						}
					};

					return expressIntent(sessionIntent).then(function (response) {

						API.ASSERT.equal(typeof response.encryptedSession, "string");

						var session = API.JWT.verify(
							response.encryptedSession,
							sessionIntent.clientSecret
						);
						if (!session) {
							throw new Error("Error decrypting encryptedSession!");
						}

						session.intent = sessionIntent;

						return session;
					});
				});
			}

			return getSession("login").then(function (session) {

				function generateSignature (method, path, data) {
					return API.JWT.sign(
						API.CRYPTO.createHash('sha1').update(API.CANONICAL_JSON({
							method: method,
							path: API.URIJS(path).removeSearch(["p", "s"]).toString(),
							data: data || null
						})).digest('hex'),
						session.intent.clientSecret + ":" + session.serverSessionProof,
						{
							expiresInSeconds: 15
						}
					);
				}

				function releaseSession (session) {
					return API.Q.denodeify(function (callback) {
						var url = serverBaseUrl + "/intent";
						return API.REQUEST({
							method: "DELETE",
							uri: url,
							headers: {
								"X-Session-Proof": session.serverSessionProof,
								"X-Session-Request-Signature": generateSignature("DELETE", "/intent")
							}
						}, function (err, response, body) {
							if (err) return callback(err);
							if (response.statusCode !== 200) {
								return callback(new Error("Did not get status 200"));
							}
							try {

								body = JSON.parse(body);

								API.ASSERT.equal(typeof body.nonce, "string");
								API.ASSERT.equal(typeof body.clientSecretProof, "string");

								var expectedClientSecretProof = API.CRYPTO.createHash('sha1').update(
									session.intent.clientSecret + ":" + session.serverSessionProof + ":" + body.nonce
								).digest('hex');

								if (body.clientSecretProof !== expectedClientSecretProof) {
									return callback(new Error("Expected client secret proof does not match the one provided"));
								}

							} catch (err) {
								return callback(err);
							}
							return callback(null);
						});
					})();
				}

				function waitUntilAuthorized () {

					function getStatus () {
						return API.Q.denodeify(function (callback) {
							var url = serverBaseUrl + "/intent";
							return API.REQUEST({
								method: "GET",
								uri: url,
								headers: {
									"X-Session-Proof": session.serverSessionProof,
									"X-Session-Request-Signature": generateSignature("GET", "/intent")
								}
							}, function (err, response, status) {
								if (err) return callback(err);
								if (response.statusCode !== 200) {
									return callback(new Error("Did not get status 200"));
								}
								return callback(null, JSON.parse(status));
							});
						})().then(function (serverStatus) {

							var status = {
								services: {}
							};
							Object.keys(session.intent.services).forEach(function (name) {
								status.services[name] = {};
								if (
									serverStatus.services &&
									serverStatus.services[name]
								) {
									status.services[name].session = serverStatus.services[name];
								}
							});

//console.log("STATUS FORMATTED", JSON.stringify(status, null, 4));

							return status;
						});
					}

					var browserProcess = null;
					function ensureBrowserOpen (callback) {
						if (browserProcess) return callback();
						browserProcess = true;

						var url = serverBaseUrl + "/login?p=" + encodeURIComponent(session.serverSessionProof) + "&s=" + encodeURIComponent(generateSignature("GET", "/login"));

						var commands = [
							// TODO: Open specific browser or app with specific profile.
							'open "' + url + '"'
						];

						if (API.VERBOSE) {
							console.log("Run commands:", commands);
						}
					    browserProcess = SPAWN("bash", [
					        "-s"
					    ], {
					    	env: process.env
					    });
					    browserProcess.on("error", function(err) {
					    	return callback(err);
					    });
					    var stdout = [];
					    var stderr = [];
					    browserProcess.stdout.on('data', function (data) {
					    	stdout.push(data.toString());
					    	if (showProgress) process.stdout.write(data);
					    });
					    browserProcess.stderr.on('data', function (data) {
					    	stderr.push(data.toString());
					    	if (showProgress) process.stdout.write(data);
					    });
					    browserProcess.stdin.write(commands.join("\n"));
					    browserProcess.stdin.end();
					    browserProcess.on('close', function (code) {
					    	if (code) {
					    		var err = new Error("Commands exited with code: " + code);
					    		err.code = code;
					    		err.stdout = stdout;
					    		err.stderr = stderr;
					    		return callback(err);
					    	}
					    });

					    // NOTE: We do not wait for browser process in any way.

						return callback(null);
					}

					var deferred = API.Q.defer();

					function loop () {
						return getStatus().then(function (status) {

							function meetsMinimum () {
								return !!status.services.github.session;
							}

							if (meetsMinimum()) {
								// All authorized so we can continue.
								if (browserProcess) {
									browserProcess.kill();
									browserProcess = null;
								}
								return deferred.resolve(status);
							}
							// NOTE: We use a callback here to break the promise chain.
							return ensureBrowserOpen(function (err) {
								if (err) return API.Q.reject(err);
								setTimeout(function () {
									loop();
								}, 1000);
							});
						}).fail(deferred.reject);
					}

					loop();

					return deferred.promise;
				}

				return waitUntilAuthorized().then(function (status) {

					if (!status.services.github.session) {
						throw new Error("Error authorizing you against at least Github!");
					}

					return status;

				}).fin(function () {

					return releaseSession(session);
				});
			});
		});
	}

});
