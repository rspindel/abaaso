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

		displayBlog = function () {
			var obj      = $("section[data-hash='blog']").first(),
			    template = "<article><h3><a href={{post_url}}>{{title}}</a></h3><date>{{date}}</date><entry>{{body}}</entry></article>";

			blog.on("afterDataListRefresh", function () {
				this.datalist.element.find("li > date").each(function (i) {
					i.text(moment(i.text()).format("dddd, MMMM Do YYYY, h:mm a"));
				});
			}, "moment");

			obj.html("<h2>Blog</h2>");
			blog.data.total > 0 ? blog.datalist = new $.datalist(obj, blog.data, template, {start: 0, end: 9}) : obj.create("p").html("No posts to display.");
			obj.create("p").create("a", {innerHTML: "Read more on attack.io", href: "http://attack.io"});
		};

		ready = function ($, d) {
			var blog    = d.blog,
			    collabs = d.collabs,
			    twitter = d.twitter;

			$.store(blog);
			blog.on("afterDataSync", function () { displayBlog(); });
			blog.data.key         = "id";
			blog.data.callback    = "jsonp";
			blog.data.source      = "response";
			blog.data.uri         = "http://api.tumblr.com/v2/blog/attackio.tumblr.com/posts?api_key=cm7cZbxWpFDtv8XFD5XFuWsn5MnzupVpUtaCjYIJAurfPj5B1V&tag=abaaso&limit=1000000&jsonp=?";

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
			$("section[data-hash='blog']").first().loading();
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
