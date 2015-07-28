
require('org.pinf.genesis.lib/lib/api').forModule(require, module, function (API, exports) {

	var Command = function () {
		this.$PLComponent = "virtualcloud-for-pio.profile/command-login/0";
	}
	Command.prototype.getLabel = function () {
		return this.label || "VirtualCloud / Authenticate";
	}
	Command.prototype.run = function () {
		var self = this;

		function ensureAuthenticated () {

			if (self["virtualcloud-for-pio.profile/vct-request/0"]) {

				return API.Q.when(require("./vct-request").for({
					args: {
						config: self["virtualcloud-for-pio.profile/vct-request/0"]
					}
				})).then(function (api) {

					return api.login({

					}).then(function (session) {

console.log("AUTHENTICATED session", session);

	process.exit(1);


					});
				});

			} else {
				throw new Error("No supported adapter declared!");
			}
		}

		return ensureAuthenticated();
	}

	exports.PLComponent = function (config, groupConfig) {
		return {
			"$tools.pinf.CloudCommands/command/0": API.EXTEND(true, new Command(), config)
		};
	}

});
