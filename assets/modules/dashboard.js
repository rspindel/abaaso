/**
 * abaaso dashboard
 *
 * @author Jason Mulligan <jason.mulligan@avoidwork.com>
 * @version 2.4.2
 */
(function (global) {
	"use strict";

	var dashboard = (function ($) {
		var blog    = {id: "blog"},
		    collabs = {id: "collabs"},
		    twitter = {
			    id      : "twitter",
			    display : function (index) {
			    	index   = index || 0;
			    	var obj = $("#twitter"),
			    	    r   = this.data.get(index);

			    	if (typeof obj !== "undefined") typeof r !== "undefined" ? obj.text(r.data.text) : obj.loading();
			    }
			},
			ready, render;

		// abaaso listeners
		ready = function ($, dashboard) {
			var uri = {
				collabs : "https://api.github.com/repos/avoidwork/abaaso/collaborators?callback=?",
				tumblr  : "http://api.tumblr.com/v2/blog/attackio.tumblr.com/posts?api_key=cm7cZbxWpFDtv8XFD5XFuWsn5MnzupVpUtaCjYIJAurfPj5B1V&tag=abaaso&limit=1000000&jsonp=?",
				twitter : "http://search.twitter.com/search.json?callback=?&from=abaaso"
			};

			// Consuming APIs
			$.store(dashboard.blog);
			dashboard.blog.data.key         = "id";
			dashboard.blog.data.callback    = "jsonp";
			dashboard.blog.data.source      = "response";
			typeof dashboard.blog.data.setUri === "function" ? dashboard.blog.data.setUri(uri.tumblr) : dashboard.blog.data.uri = uri.tumblr;

			$.store(dashboard.collabs);
			dashboard.collabs.data.source   = "data";
			dashboard.collabs.data.key      = "id";
			dashboard.collabs.data.callback = "callback";
			typeof dashboard.collabs.data.setUri === "function" ? dashboard.api.data.setUri(uri.collabs) : dashboard.collabs.data.uri = uri.collabs;

			$.store(dashboard.twitter);
			dashboard.twitter.data.key      = "id";
			dashboard.twitter.data.callback = "callback";
			dashboard.twitter.on("afterDataSync", function() { this.display(); }, "sync");
			typeof dashboard.twitter.data.setUri === "function" ? dashboard.twitter.data.setUri(uri.twitter) : dashboard.twitter.data.uri = uri.twitter;
		};

		render = function ($, dashboard) {
			var stage  = $("#stage"),
			    obj, root;

			// Creating tabs
			stage.tabs(["Main", "API", "Blog", "Download", "Examples"]);

			// Setting routing
			$.route.set("download", function () {
				obj = $("section[data-hash='download']")[0];
				if (obj.innerHTML.isEmpty()) obj.get("views/download.htm");
			});

			$.route.set("blog", function () {
				obj = $("section[data-hash='blog']")[0];
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
				};

				obj.loading();
				$.repeat(fn, 10, "blog");
			});

			$.route.set("api", function () {
				obj = $("section[data-hash='api']")[0];
				if (obj.innerHTML.isEmpty()) obj.get("views/api.htm");
			});

			$.route.set("error", function () {
				obj = $("section[data-hash='main']")[0].addClass("active").removeClass("hidden");
				obj.get("views/error.htm");
			});

			$.route.set("examples", function () {
				obj = $("section[data-hash='examples']")[0];
				if (obj.innerHTML.isEmpty()) obj.get("views/examples.htm");
			});

			$.route.set("main", function () {
				obj = $("section[data-hash='main']")[0];
				if (obj.innerHTML.isEmpty()) obj.get("views/intro.htm");
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

	define("dashboard", ["abaaso", "abaaso.tabs"], function (abaaso, tabs) {
		var $ = global[abaaso.aliased],
		    d = dashboard($);

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
