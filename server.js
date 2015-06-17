
const EXPRESS = require("express");
const SEND = require("send");
const HTTP = require("http");


require('org.pinf.genesis.lib').forModule(require, module, function (API, exports) {

	return API.Q.denodeify(function (callback) {

		var app = EXPRESS();

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

		app.get("/", function (req, res, next) {
			var path = req.params[0];
			return SEND(req, path, {
				root: API.PATH.join(__dirname, "www")
			}).on("error", next).pipe(res);
		});


		HTTP.createServer(app).listen(API.config.port, API.config.bind);

		console.log("Server listening at: http://" + API.config.bind + ":" + API.config.port);

		return callback(null);
	})();

});
