/**
 * abaaso dashboard
 *
 * @author Jason Mulligan <jason.mulligan@avoidwork.com>
 * @version 2.3
 */
(function (window) {
	var $ = window[abaaso.aliased],
	    dashboard, ready, render;

	dashboard = (function () {
		// Data stores
		var blog    = {id: "blog"},
		    collabs = {id: "collabs"},
		    twitter = {
			    id      : "twitter",
			    display : function(index) {
			    	index   = index || 0;
			    	var obj = $("#twitter"),
			    	    r   = this.data.get(index);

			    	if (typeof obj !== "undefined") typeof r !== "undefined" ? obj.text(r.data.text) : obj.loading();
			    }
			},
			api;

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
			elements : function(s) {
				try {
					var i, x, y;

					for (i in s) {
						if (!s.hasOwnProperty(i)) continue;
						this.generate(i, i, "apis");
						for (x in s[i]) {
							if (/bind|prototype/.test(x) || i === "$") continue;

							var id  = i+"-"+x,
								key = i+"."+x;

							if (typeof $("#"+i+"-sub") === "undefined" && typeof $("#"+i) !== "undefined") {
								$("#"+i).style.listStyleType = "square";
								$("#"+i).create("ul", {id: i+"-sub", "class": "sub"}).hide();
							}
							this.generate(x, key, i+"-sub", id);
							for (y in s[i][x]) {
								if (y === "prototype") continue;

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
			generate : function(item, key, target, id){
				if (typeof $("#"+target) === "undefined") return;
				id = id || item.replace(/(\&|,|(\s)|\/)/gi,"").toLowerCase();
				if (id === "$") id = "helper";

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
								$("#stage").clear();
								panel = $("#stage").create("article");
								if (typeof record !== "undefined") {
									panel.create("h2").text(record.key);
									panel.create("h3").text(record.data.type);
									panel.create("p").text(record.data.description.replace(/\n/g, "<br />"));
									if (record.data.sample !== null) {
										panel.create("h4").text("Sample");
										panel.create("code").text(record.data.sample.replace(/\n/g, "<br />"));
									};
								}
								else { panel.create("h2").text("Could not find the requested record"); }
							});
			},

			/**
			 * Creates the API widget using abaaso
			 */
			render : function() {
				this.elements({prototypes: this.structure(this.prototypes)});
				this.elements(this.structure(abaaso));
			},

			/**
			 * Returns the abaaso library structure with API URIs as a property
			 *
			 * @returns {object}
			 */
			structure : function(s) {
				var structure, getChildren;

				/**
				 * Finds the children of o
				 *
				 * @param o {object} The object to iterate
				 * @returns {object}
				 */
				getChildren = function(o, x) {
					x = x || 1;
					var i, m = 3, c = {};

					// Max recusion is 3 levels
					if (x >= m) return;

					if (o instanceof Array) {
						o.each(function(i) {
							c[i] = typeof o[i] === "object" ? getChildren(o[i], (x + 1)) : {};
						});
					}
					else {
						for (i in o) {
							if (!o.hasOwnProperty(i)) continue;
							c[i] = o[i] instanceof Object ? getChildren(o[i], (x + 1)) : {};
						}
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
					structure.data.uri        = {};
					structure.data.callback   = {};
					structure.data.key        = {};
					structure.data.keys       = {};
					structure.data.parentNode = {};
					structure.data.records    = {};
					structure.data.source     = {};
					structure.data.total      = {};
					structure.data.views      = {};
					structure.state.current   = {};
					delete structure.constructor;
					delete structure.callback;
					delete structure.data.methods;
					delete structure.data._uri;
					delete structure.state._current;
					delete structure.dashboard;
					delete structure.error.log;
					delete structure.fx;
					delete structure.timer;
				}

				return structure;
			}
		};

		// @constructor
		return {
			api     : api,
			blog    : blog,
			collabs : collabs,
			twitter : twitter
		}
	})();


	/**
	 * abaaso ready lsitener
	 * 
	 * @return {Undefined} undefined
	 */
	ready = function () {
		var uri   = {
			api     : "http://api.abaaso.com?callback=?",
			collabs : "https://api.github.com/repos/avoidwork/abaaso/collaborators?callback=?",
			tumblr  : "http://api.tumblr.com/v2/blog/attackio.tumblr.com/posts?api_key=cm7cZbxWpFDtv8XFD5XFuWsn5MnzupVpUtaCjYIJAurfPj5B1V&tag=abaaso&limit=1000000&jsonp=?",
			twitter : "http://search.twitter.com/search.json?callback=?&from=abaaso"
		};

		// Consuming APIs
		$.store(dashboard.api);
		dashboard.api.data.key = "name";
		dashboard.api.on("afterDataSync", function(){ this.render(); });
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

	/**
	 * abaaso render lsitener
	 * 
	 * @return {Undefined} undefined
	 */
	render = function () {
		var stage = $("#stage"),
		    api   = $("#api");

		// Setting routing
		$.route.set("api", function () {
			api.removeClass("hide");
			stage.addClass("share").get("views/api.htm");
		});

		$.route.set("blog", function () {
			api.addClass("hide");
			stage.removeClass("share").loading();

			var fn = function() {
				if (dashboard.blog.data.total > 0) {
					var items = dashboard.blog.data.get([0, 10]),
					    d, o;

					stage.clear();

					items.each(function(item) {
						d = item.data.date.replace(/\s.*/, "").explode("-"); // Parsing String because some browsers will not cast to Date
						o = stage.create("article");
						o.create("h3").create("a", {href: item.data.post_url, innerHTML: item.data.title});
						o.create("date").text($.label.month[parseInt(d[1] -1 ).toString()]+" "+d[2]+", "+d[0]);
						o.create("entry").text(item.data.body);
					});

					stage.create("p").create("a", {innerHTML: "Read more on attack.io", href: "http://attack.io"});
					return false;
				}
			};

			$.repeat(fn, 10, "blog");
		});

		$.route.set("download", function () {
			var guid = $.guid();

			api.addClass("hide");
			stage.removeClass("share")
			     .on("afterGet", function() {
			     	this.un("afterGet", guid);
			     	$("#download-debugging").on("click", function () { location = "https://raw.github.com/avoidwork/abaaso/v" + parseFloat($.version) + "/abaaso.js"; }, "click");
			     	$("#download-production").on("click", function () { location = "https://raw.github.com/avoidwork/abaaso/v" + parseFloat($.version) + "/abaaso-min.js"; }, "click");
			     }, guid)
			     .get("views/download.htm");
		});

		$.route.set("error", function () {
			api.addClass("hide");
			stage.removeClass("share").get("views/error.htm");
		});

		$.route.set("examples", function () {
			api.addClass("hide");
			stage.removeClass("share").get("views/examples.htm");
		});

		$.route.set("main", function () {
			api.addClass("hide");
			stage.removeClass("share").get("views/intro.htm");
		});

		// Prepping the UI
		$.loading.url = "assets/loading.gif";

		$("version").text($.version);
		$("year").text(new Date().getFullYear());

		stage.on("beforeGet", function () { this.loading(); }, "loading")
		     .on("afterGet", function () { if (typeof $("#twitter") !== "undefined") dashboard.twitter.display(); }, "twitter");

		$("body").css("opacity", 1);

		if (!/\w/.test(document.location.hash)) document.location.hash = "#!/main";
		else $.route.load(document.location.hash);
	};

	// AMD support
	switch (true) {
		case typeof define === "function":
			define("dashboard", ["abaaso", "abaasoroute"], function () {
				ready();
				render();
				return dashboard;
			});
			break;
		default:
			$.on("ready", ready).on("render", render);
	}
})(window);
