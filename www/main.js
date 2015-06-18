
((function(window) {

	function redirect(path) {
		window.location.href = path;
	}

	function init() {

		$('DIV[link-to]').click(function() {
			return redirect($(this).attr("link-to"));
		});

	}

	init();

})(this));
