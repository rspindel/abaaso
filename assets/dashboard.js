/**
 * abaaso dashboard
 *
 * @author Jason Mulligan <jason.mulligan@avoidwork.com>
 * @version 2.4
 */
(function () {
	"use strict";

	var dashboard = (function () {
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
			api, ready, render;

		// API widget
		api = {
			id: "api",

			/**
			 * Collection of methods to add to prototypes
			 * Managed manually because these are hidden in closure
			 */
			prototypes : {
				array   : ["contains", "diff", "first", "index", "indexed", "keys", "last", "on", "remove", "total"],
				element : ["create", "disable", "enable", "get", "hide", "isAlphaNum", "isBoolean", "isDate", "isDomain", "isEmail", "isEmpty", "isIP", "isInt", "isNumber", "isPhone", "isString", "loading", "on", "position", "show", "text", "update", "validate"],
				number  : ["isEven", "isOdd", "on"],
				shared  : ["clear", "destroy", "fire", "genId", "listeners", "un"],
				string  : ["capitalize", "isAlphaNum", "isBoolean", "isDate", "isDomain", "isEmail", "isEmpty", "isIP", "isInt", "isNumber", "isPhone", "isString", "on", "trim"]
			},

			/**
			 * Iterates an object and executes generate() on the children,
			 * supports 3 levels deep
			 *
			 * @param s {object} The object to iterate
			 */
			elements : function (s) {
				try {
					var i, x, y;

					for (i in s) {
						if (!s.hasOwnProperty(i)) continue;
						this.generate(i, i, "apis");
						for (x in s[i]) {
							if (!s[i].hasOwnProperty(x) || /bind|prototype/.test(x) || i === "$") continue;

							var id  = i+"-"+x,
								key = i+"."+x;

							if (typeof $("#"+i+"-sub") === "undefined" && typeof $("#"+i) !== "undefined") {
								$("#"+i).style.listStyleType = "square";
								$("#"+i).create("ul", {id: i+"-sub", "class": "sub"}).hide();
							}
							this.generate(x, key, i+"-sub", id);
							for (y in s[i][x]) {
								if (!s[i][x].hasOwnProperty(y) || y === "prototype") continue;

								var id  = i+"-"+x+"-"+y,
									key = i+"."+x+"."+y;

								if (typeof $("#"+i+"-"+x+"-sub") === "undefined" && typeof $("#"+i+"-"+x) !== "undefined") {
									$("#"+i+"-"+x).style.listStyleType = "square";
									$("#"+i+"-"+x).create("ul", {id: i+"-"+x+"-sub", "class": "sub"}).hide();
								}
								this.generate(y, key, i+"-"+x+"-sub", id);
							}
						}
					}
				}
				catch (e) {
					$.error(e, arguments, this);
				}
			},

			/**
			 * Generates the HTML elements for the API widget
			 *
			 * @param item {object} The item to add to the tree
			 * @param key {string} The record key
			 * @param target {string} The target element to add the item to
			 */
			generate : function (item, key, target, id){
				if (typeof $("#"+target) === "undefined") return;
				id = id || item.replace(/(\&|,|(\s)|\/)/gi,"").toLowerCase();
				if (id === "$") id = "helper";

				var dashboard = window.dashboard;

				$("#"+target).create("li", {id: id})
				             .create("a", {id: id+"-anchor", innerHTML: item, "class": "nav"})
							 .on("click", function(){
								var list   = $("#"+this.parentNode.id+"-sub"),
									record = dashboard.api.data.get(key),
									panel;

								if (typeof list !== "undefined") {
									switch ($.el.hidden(list)) {
										case true:
											this.parentNode.style.listStyleType = "circle";
											list.show();
											break;
										case false:
											this.parentNode.style.listStyleType = "square";
											list.hide();
											break;
									}
								}
								panel = $("#copy").clear().create("article");
								if (typeof record !== "undefined") {
									panel.create("h2").text(record.key);
									panel.create("h3").text(record.data.type);
									panel.create("p").text(record.data.description.replace(/\n/g, "<br />"));
									if (record.data.sample !== null) {
										panel.create("h4").text("Sample");
										panel.create("code").text(record.data.sample.replace(/\n/g, "<br />"));
									};
								}
								else panel.create("h2").text("Could not find the requested record");
							});
			},

			/**
			 * Creates the API widget using abaaso
			 */
			render : function () {
				this.elements({prototypes: this.structure(this.prototypes)});
				this.elements(this.structure(abaaso));
			},

			/**
			 * Returns the abaaso library structure with API URIs as a property
			 *
			 * @returns {object}
			 */
			structure : function (s) {
				var structure, getChildren;

				/**
				 * Finds the children of o
				 *
				 * @param o {object} The object to iterate
				 * @returns {object}
				 */
				getChildren = function (o, x) {
					x = x || 1;
					var i, m = 3, c = {};

					// Max recusion is 3 levels
					if (x >= m) return;

					switch (true) {
						case o instanceof Array:
							o.each(function (v, k) { c[v] = typeof v === "function" ? {} : getChildren(v, x++); });
							break;
						case o instanceof Object:
							if (o.hasOwnProperty("each")) $.iterate(o, function (v, k) {
								c[k] = typeof v === "function" ? {} : getChildren(v, x++);
							});
							else o.each(function (v, k) {
								c[k] = typeof v === "function" ? {} : getChildren(v, x++);
							});
							break;
					}

					return c;
				};

				structure = getChildren(s);

				// Cleaning up the object
				if (s === abaaso) {
					structure.id              = {};
					structure.hidden          = {};
					structure.ready           = {};
					structure.version         = {};
					structure.data            = {};
					structure.data.uri        = {};
					structure.data.callback   = {};
					structure.data.key        = {};
					structure.data.keys       = {};
					structure.data.parentNode = {};
					structure.data.records    = {};
					structure.data.source     = {};
					structure.data.total      = {};
					structure.data.views      = {};
					structure.state           = {};
					structure.state.current   = {};
					delete structure.constructor;
					delete structure.callback;
					delete structure.data.methods;
					delete structure.data._uri;
					delete structure.state._current;
					delete structure.dashboard;
					delete structure.error.log;
					delete structure.timer;
					delete structure.route;
					delete structure.tabs;
				}

				return structure;
			}
		};

		// abaaso listeners
		ready = function () {
			var dashboard = window.dashboard,
			    uri = {
				api     : "http://api.abaaso.com?callback=?",
				collabs : "https://api.github.com/repos/avoidwork/abaaso/collaborators?callback=?",
				tumblr  : "http://api.tumblr.com/v2/blog/attackio.tumblr.com/posts?api_key=cm7cZbxWpFDtv8XFD5XFuWsn5MnzupVpUtaCjYIJAurfPj5B1V&tag=abaaso&limit=1000000&jsonp=?",
				twitter : "http://search.twitter.com/search.json?callback=?&from=abaaso"
			};

			// Consuming APIs
			$.store(dashboard.api);
			dashboard.api.data.key = "name";
			typeof dashboard.api.data.setUri === "function" ? dashboard.api.data.setUri(uri.api) : dashboard.api.data.uri = uri.api;

			$.store(dashboard.blog);
			dashboard.blog.data.key         = "id";
			dashboard.blog.data.callback    = "jsonp";
			dashboard.blog.data.source      = "response";
			typeof dashboard.blog.data.setUri === "function" ? dashboard.blog.data.setUri(uri.tumblr) : dashboard.blog.data.uri = uri.tumblr;

			$.store(dashboard.collabs);
			dashboard.collabs.data.source   = "data";
			dashboard.collabs.data.key      = "id";
			typeof dashboard.collabs.data.setUri === "function" ? dashboard.api.data.setUri(uri.collabs) : dashboard.collabs.data.uri = uri.collabs;

			$.store(dashboard.twitter);
			dashboard.twitter.data.key      = "id";
			dashboard.twitter.data.callback = "callback";
			dashboard.twitter.on("afterDataSync", function() { this.display(); }, "sync");
			typeof dashboard.twitter.data.setUri === "function" ? dashboard.twitter.data.setUri(uri.twitter) : dashboard.twitter.data.uri = uri.twitter;
		};

		render = function () {
			var stage     = $("#stage"),
			    dashboard = window.dashboard,
			    obj;

			// Creating tabs
			stage.tabs(["Main", "API", "Blog", "Download", "Examples"]);
			obj = $("section.root")[0],

			// Setting routing
			$.route.set("download", function () {
				var guid = $.guid();

				obj.on("afterGet", function () {
					this.un("afterGet", guid);
					$("#download-debugging").on("click", function () { location = "https://raw.github.com/avoidwork/abaaso/v" + parseFloat($.version) + "/debug/abaaso.js"; }, "click");
					$("#download-production").on("click", function () { location = "https://raw.github.com/avoidwork/abaaso/v" + parseFloat($.version) + "/production/abaaso.js"; }, "click");
				}, guid).get("views/download.htm");
			});

			$.route.set("blog", function () {
				var fn  = function () {
					if (dashboard.blog.data.total > 0) {
						var items = dashboard.blog.data.get([0, 10]),
						    d, o;

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
				var guid = $.guid(),
				    fn   = function () {
				    	if (dashboard.api.data.total > 0) {
				    		dashboard.api.render();
				    		return false;
				    	}
				    };

				obj.on("afterGet", function () {
					this.un("afterGet", guid);
					$.repeat(fn, 10, "api");
				}, guid).get("views/api.htm");
			});

			$.route.set("error", function () {
				obj.get("views/error.htm");
			});

			$.route.set("examples", function () {
				obj.get("views/examples.htm");
			});

			$.route.set("main", function () {
				obj.get("views/intro.htm");
			});

			// Prepping the UI
			$.loading.url = "assets/loading.gif";
			$("version").text($.version);
			$("year").text(new Date().getFullYear());
			obj.on("beforeGet", function () { this.loading(); }, "loading").on("afterGet", function () { if (typeof $("#twitter") !== "undefined") dashboard.twitter.display(); }, "twitter");
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
			api     : api,
			blog    : blog,
			collabs : collabs,
			ready   : ready,
			render  : render,
			twitter : twitter
		}
	});

	// AMD support
	switch (true) {
		case typeof define === "function":
			define("dashboard", ["abaaso", "abaaso.route", "abaaso.tabs"], function () {
				var $ = window[abaaso.aliased];
				window.dashboard = dashboard();
				window.dashboard.ready();
				window.dashboard.render();
			});
			break;
		default:
			window.dashboard = dashboard();
			abaaso.on("ready", window.dashboard.ready).on("render", window.dashboard.render);
	}
})();
