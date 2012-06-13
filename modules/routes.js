/**
 * GUI routes
 * 
 * @param  {Object} global Window
 * @return {Boolean}       true
 */
(function (global) {
	define(["abaaso", "abaaso.route"], function (abaaso) {
		var $     = global[abaaso.aliased],
		    stage = $("#stage");

		$.route.default = "main";

		$.route.set("main", function () { $("section[data-hash='main']").first().get("views/intro.htm"); })

		$.route.set("download", function () { $("section[data-hash='download']").first().get("views/download.htm"); });
		
		$.route.set("blog", function () {
			$("section[data-hash='blog']").first().loading();
			dashboard.blog.display();
		});
		
		$.route.set("api", function () {
			$("section[data-hash='api']").first().html("Redirecting to Github");
			location = "https://github.com/avoidwork/abaaso/wiki";
		});
		
		$.route.set("error", function () {
			var guid = $.guid(true);

			$("section[data-hash='main']").first().on("afterGet", function () {
				this.un("afterGet", guid);
				$.tabs.active("main");
				$.defer(function () { location.hash = $.route.default; }, 5000);
			}, guid).get("views/error.htm");
		});
		
		$.route.set("examples", function () { $("section[data-hash='examples']").first().get("views/examples.htm"); });

		return true;
	});
})(this);