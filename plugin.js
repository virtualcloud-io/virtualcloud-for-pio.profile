

exports.for = function (API) {

	var exports = {};

	exports.resolve = function (resolver, config, previousResolvedConfig) {

		return resolver({}).then(function (resolvedConfig) {

console.log("VIRTUALCLOUD FOR PIO.PROFILE resolvedConfig", JSON.stringify(resolvedConfig, null, 4));

			function login () {

				return API.Q.when(require("./api/vct-request").for({
					args: {
						config: {
							"sdfsdf": "sdfsdfs333"
						}
					}
				})).then(function (api) {

console.log("vct-request API", api);

process.exit(1);

				});



				return API.Q.denodeify(function (callback) {

					return API.ASYNC.FORGE(function (FORGE) {

console.log("resolvedConfig", resolvedConfig);

						var serverBaseUrl = resolvedConfig.server.baseUrl;

						var pubkeyUrl = serverBaseUrl + "/pubkey";

						API.console.verbose("Call pubkeyUrl:", pubkeyUrl);

						return API.REQUEST(pubkeyUrl, function (err, response, publicKeyPem) {
							if (err) return callback(err);

							var publicKey = FORGE.pki.publicKeyFromPem(publicKeyPem);

							var request = FORGE.util.encode64(publicKey.encrypt(FORGE.util.hexToBytes(JSON.stringify({
								repository: "OUR REPO",
								branch: "OUR BRANCH",
								rootSecretHash: "OUR SECRET HASH", 
								publicKeyFingerprint: "OUR FINGERPRINT"
							}))));

							var url = serverBaseUrl + "/login?request=" + encodeURIComponent(request);

							return API.runCommands([
								'open ' + url
							], {}, function (err, stdout) {
								if (err) return callback(err);

		console.log("stdout", stdout);						

							});
						});
					});
				})();
			}

			return login().then(function () {

resolvedConfig.t = Date.now();

				return resolvedConfig;
			});
/*
				requested = {
					repository: req.body.repository,
					branch: req.body.branch,
					rootSecretHash: req.body.rootSecretHash, 
					publicKeyFingerprint: req.body.publicKeyFingerprint					
				};
*/


		});
	}

	exports.turn = function (resolvedConfig) {

console.log("TURN VIRTUALCLOUD", resolvedConfig);

	}

	return exports;
}

