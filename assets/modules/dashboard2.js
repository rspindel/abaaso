/**
 * abaaso dashboard
 *
 * @author Jason Mulligan <jason.mulligan@avoidwork.com>
 * @version 3.0
 */
(function (global) {
	"use strict";

	var dashboard = (function ($) {
		var blog    = {id: "blog"},
		    collabs = {id: "collabs"},
		    twitter = {
			    id      : "twitter",
			    display : function (index) {
			    	index = index || 0;
			    	var r = this.data.get(index);

			    	$("#twitter").create("p").text(typeof r !== "undefined" ? r.data.text : "Nothing in the fire hose");
			    }
			},
			ready, render;

		ready = function ($, d) {
			$.store(d.blog);
			d.blog.data.key         = "id";
			d.blog.data.callback    = "jsonp";
			d.blog.data.source      = "response";
			d.blog.data.uri         = "http://api.tumblr.com/v2/blog/attackio.tumblr.com/posts?api_key=cm7cZbxWpFDtv8XFD5XFuWsn5MnzupVpUtaCjYIJAurfPj5B1V&tag=abaaso&limit=1000000&jsonp=?";

			$.store(d.collabs);
			d.collabs.data.key      = "id";
			d.collabs.data.callback = "callback";
			d.collabs.data.source   = "data";
			d.collabs.data.uri      = "https://api.github.com/repos/avoidwork/abaaso/collaborators?callback=?";

			$.store(d.twitter);
			d.twitter.data.key      = "id";
			d.twitter.data.callback = "callback";
			d.twitter.on("afterDataSync", function() { this.display(); }, "sync");
			d.twitter.data.uri      = "http://search.twitter.com/search.json?callback=?&from=abaaso";
		};

		render = function ($, dashboard) {
			var stage  = $("#stage"),
			    obj, root;

			// Creating tabs
			stage.tabs(["Main", "API", "Blog", "Download", "Examples"]);

			// Setting routing
			$.route.set("download", function () {
				$("section[data-hash='download']")[0].get("views/download.htm");
			});

			$.route.set("blog", function () {
				var fn  = function () {
					if (dashboard.blog.data.total > 0) {
						var items = dashboard.blog.data.get(0, 9), d, o;

						obj.clear();

						items.each(function (item) {
							d = item.data.date.replace(/\s.*/, "").explode("-"); // Parsing String because some browsers will not cast to Date
							o = obj.create("article");
							o.create("h3").create("a", {href: item.data.post_url, innerHTML: item.data.title});
							o.create("date").text($.label.month[parseInt(d[1] -1 ).toString()]+" "+d[2]+", "+d[0]);
							o.create("entry").text(item.data.body);
						});

						obj.create("p").create("a", {innerHTML: "Read more on attack.io", href: "http://attack.io"});
						return false;
					}
					else obj.create("p").html("No posts to display.");
				};

				obj = $("section[data-hash='blog']")[0];
				obj.loading();

				$.repeat(fn, 10, "blog");
			});

			$.route.set("api", function () {
				$("section[data-hash='api']").html("Redirecting to Github");
				location = "https://github.com/avoidwork/abaaso/wiki";
			});

			$.route.set("error", function () {
				$("section[data-hash='main']")[0].get("views/error.htm");
			});

			$.route.set("examples", function () {
				$("section[data-hash='examples']")[0].get("views/examples.htm");
			});

			$.route.set("main", function () {
				$("section[data-hash='main']")[0].get("views/intro.htm");
			});

			// Prepping the UI
			$.loading.url = "assets/loading.gif";
			$("version").text($.version);
			$("year").text(new Date().getFullYear());
			$("section").on("beforeGet", function () { this.loading(); }, "loading");
			$("section[data-hash='main']").on("afterGet", function () { twitter.display(); }, "twitter");
			$("ul.tab a").addClass("shadow round button padded");
			$("body").css("opacity", 1);

			// Setting the hash
			if (!/\w/.test(location.hash)) location.hash = "#!/main";
			else {
				$.tabs.active(location.hash);
				$.route.load(location.hash);
			}
		};

		// @constructor
		return {
			blog    : blog,
			collabs : collabs,
			ready   : ready,
			render  : render,
			twitter : twitter
		};
	});

	define("dashboard", ["abaaso", "abaaso.tabs"], function (abaaso) {
		var $ = global[abaaso.aliased],
		    d = dashboard($);

		if ($.client.ie && $.client.version < 9) {
			location = "upgrade.html";
			return;
		}

		$.repeat(function () {
			if (/loaded|complete/.test(document.readyState) && typeof $("body")[0] !== "undefined") {
				d.ready($, d);
				d.render($, d);
				delete d.ready;
				delete d.render;
				return false;
			}
		}, 10);

		return d;
	});
})(this);
