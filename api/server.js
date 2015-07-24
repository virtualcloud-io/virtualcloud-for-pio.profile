
require('org.pinf.genesis.lib/lib/api').forModule(require, module, function (API, exports) {

	// Expose a HTTP interface.
	exports["github.com/creationix/stack/0"] = function (req, res, next) {


console.log("VIRTUALCLOUD FOR PIO.PROFILE - req.url", req.url);
console.log("VIRTUALCLOUD FOR PIO.PROFILE - req.args", req.args);
console.log("VIRTUALCLOUD FOR PIO.PROFILE - req.params", req.params);
console.log("VIRTUALCLOUD FOR PIO.PROFILE - req.body", req.body);


		return res.end("Hello World for VIRTUALCLOUD FOR PIO.PROFILE !!!");
	}

});

