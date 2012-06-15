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
			    	var r = this.data.get(index),
			    	    t = $("#twitter");

			    	if (typeof t !== "undefined") t.clear().create("p").html(typeof r !== "undefined" ? r.data.text : "Nothing in the fire hose");
			    }
			},
			displayBlog, ready, render;

		displayBlog = function (data) {
			var items = data.get(0, 9),
			    obj   = $("section[data-hash='blog']").first(),
			    d, o;

			obj.html("<h2>Blog</h2>");

			if (typeof items.first() !== "undefined") {
				items.each(function (item) {
					if (typeof item.data === "undefined") debugger;
					d = item.data.date.replace(/\s.*/, "").explode("-"); // Parsing String because some browsers will not cast to Date
					o = obj.create("article");
					o.create("h3").create("a", {href: item.data.post_url, innerHTML: item.data.title});
					o.create("date").html($.label.month[parseInt(d[1] -1 ).toString()]+" "+d[2]+", "+d[0]);
					o.create("entry").html(item.data.body);
				});
				obj.create("p").create("a", {innerHTML: "Read more on attack.io", href: "http://attack.io"});
			}
			else obj.create("p").html("No posts to display.");
		};

		ready = function ($, d) {
			var blog    = d.blog,
			    collabs = d.collabs,
			    twitter = d.twitter,
			    data;

			$.store(blog);
			data = blog.data;
			blog.on("afterDataSync", function () { displayBlog(data); });
			data.key         = "id";
			data.callback    = "jsonp";
			data.source      = "response";
			data.uri         = "http://api.tumblr.com/v2/blog/attackio.tumblr.com/posts?api_key=cm7cZbxWpFDtv8XFD5XFuWsn5MnzupVpUtaCjYIJAurfPj5B1V&tag=abaaso&limit=1000000&jsonp=?";
			blog.display     = function () { displayBlog(blog.data); }; // public hook to this method

			$.store(collabs);
			collabs.data.key      = "id";
			collabs.data.callback = "callback";
			collabs.data.source   = "data";
			collabs.data.uri      = "https://api.github.com/repos/avoidwork/abaaso/collaborators?callback=?";

			$.store(twitter);
			twitter.data.key      = "id";
			twitter.data.callback = "callback";
			twitter.on("afterDataSync", function() { this.display(); }, "sync");
			twitter.data.uri      = "http://search.twitter.com/search.json?callback=?&from=abaaso";
		};

		render = function ($, d) {
			var stage = $("#stage");

			// Creating tabs
			stage.tabs(["Main", "API", "Blog", "Download", "Examples"]);

			// Prepping the UI
			$.loading.url = "assets/loading.gif";
			$("version").html($.version);
			$("year").html(new Date().getFullYear());
			$("section").on("beforeGet", function () { this.loading(); }, "loading");
			$("section[data-hash='main']").first().on("afterGet", function () { twitter.display(); }, "twitter");
			$("ul.tab a").addClass("shadow round button padded");
			$("body").css("opacity", 1);

			// Setting routing, setting the active tab
			require(["routes"], function () { $.tabs.active($.route.init()); });
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

	define("dashboard", ["abaaso", "abaaso.tabs", "abaaso.datalist"], function (abaaso) {
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
