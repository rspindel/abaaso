/**
 * abaaso API dashboard
 *
 * Creates a RESTful GUI with 1 application state
 *
 * @author Jason Mulligan <jason.mulligan@avoidwork.com>
 * @version 1.4
 */

// Setting listener to construct the View
$.on("ready", function() {
	// Setting the application state
	typeof this.state.change === "function" ? this.state.change("read") : this.state.current = "read";
	this.state.header = "Application-State";

	// Setting the loading() icon
	this.loading.url = "assets/loading.gif";

	// Setting up the GUI
	$("a")[0].on("click", function() { $("#stage").get("views/intro.htm"); });
	$("#api").on("click", function() { $.el.hidden(this) ? this.show() : this.hide(); }, "nav", $("#nav-items"));
	$("#download").on("click", function() {
		$("#stage").on("afterGet", function() {
			this.un("afterGet", "download");
			$("#download-debugging").on("click", function(){ window.location = "https://raw.github.com/avoidwork/abaaso/v" + parseFloat($.version) + "/abaaso.js"; });
			$("#download-production").on("click", function(){ window.location = "https://raw.github.com/avoidwork/abaaso/v" + parseFloat($.version) + "/abaaso-min.js"; });
		}, "download").get("views/download.htm");
	});
	$("klout")[0].jsonp("http://api.klout.com/1/klout.json?users=jasonmulligan&key=n2789brx4aadvupykc5mt93u&callback=?", "users[0].kscore");
	$("#nav").opacity(0);
	$("#nav-items").hide();
	$("#stage").opacity(0);
	$("version")[0].text($.version);
	$("year")[0].text(new Date().getFullYear());

	$("#sample").on("click", function() {
		$("#stage").on("afterGet", function() {
			this.un("afterGet", "display");
			$("#code").get("assets/dashboard.js");
		}, "display").get("views/sample.htm");
	});

	$("#stage").on("beforeGet", function() { this.loading(); }, "loading")
	           .on("afterGet",  function() { this.opacity(0).fade(1000); }, "fade")
	           .on("afterFade", function() { if (typeof $("#twitter") !== "undefined") twitter(); }, "twitter")
	           .get("views/intro.htm");

	// Setting up Wordpress retrieval & display
	$.store(blog);
	blog.data.key      = "id";
	blog.data.callback = "jsonp";
	blog.on("afterDataSync", function(data) {
		$("#blog").un("click")
		          .on("click", function(e) {
						var stage = $("#stage"),
						    items = this.get(),
						    c, d, o;

						stage.opacity(0).clear();

						items.each(function(item) {
							c = item.data.content.split(/\r/);
							d = new Date(item.data.date);
							o = stage.create("article", {"class": "panel"});

							o.create("h3").text(item.data.title.replace("&#8217;", "'"));
							o.create("p").text($.label.months[d.getMonth()]+" "+d.getDate()+", "+d.getFullYear());

							c.each(function(p) { if (!p.isEmpty()) o.create("p").text(p.replace("&#8217;", "'")); });
						});
						stage.create("p").create("a", {innerHTML: "Read more on attack.io", href: "http://attack.io"});
						stage.fade(1000);
					}, "display", blog.data);
	});

	// Setting the API widget
	$.store(api);
	api.data.key = "name";
	api.on("afterDataSync", function(){ this.render(); });
	typeof api.data.setUri === "function" ? api.data.setUri("http://abaaso.com/api") : api.data.uri = "http://abaaso.com/api";
});

// Wordpress
var blog = {id: "blog"};

// API widget
var api = {
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
				this.generate(i, i, "nav-items");
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
							record = api.data.get(key),
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
						$("#stage").clear().opacity(0);
						panel = $("#stage").create("div", {"class": "panel"});
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
						$("#stage").fade(1000);
					});
	},

	/**
	 * Creates the API widget using abaaso
	 */
	render : function(){
		this.elements({prototypes: this.structure(this.prototypes)});
		this.elements(this.structure(abaaso));

		// Retrieving blog content
		typeof blog.data.setUri === "function" ? blog.data.setUri("http://attack.io/category/abaaso/?feed=json&jsonp=?")
		                                       : blog.data.uri = "http://attack.io/category/abaaso/?feed=json&jsonp=?";

		$("#nav").fade(1000);
	},

	/**
	 * Returns the abaaso library structure with API URIs as a property
	 *
	 * @returns {object}
	 */
	structure : function(s){
		var structure, getChildren;

		/**
		 * Finds the children of o
		 *
		 * @param o {object} The object to iterate
		 * @returns {object}
		 */
		getChildren = function(o){
			var i, c = {};

			if (o instanceof Array) {
				o.each(function(i) {
					c[i] = typeof o[i] === "object" ? getChildren(o[i]) : {};
				});
			}
			else {
				for (i in o) {
					if (!o.hasOwnProperty(i)) continue;
					c[i] = typeof o[i] === "object" ? getChildren(o[i]) : {};
				}
			}

			return c;
		};

		structure = getChildren(s);

		// Cleaning up the object
		if (s === abaaso) {
			structure.id       = {};
			structure.hidden   = {};
			structure.ready    = {};
			structure.version  = {};
			structure.data.uri = {};
			structure.data.callback   = {};
			structure.data.key        = {};
			structure.data.keys       = {};
			structure.data.parentNode = {};
			structure.data.records    = {};
			structure.data.source     = {};
			structure.data.total      = {};
			structure.data.views      = {};
			structure.state.current   = {};
			delete structure.callback;
			delete structure.data.methods;
			delete structure.data._uri;
			delete structure.state._current;
			delete structure.dashboard;
			delete structure.error.events;
			delete structure.fx;
			delete structure.timer;
		}

		return structure;
	}
};

/**
 * Retrieves the latest tweet from @abaaso
 */
var twitter = function() {
	if (typeof twitter.tweet === "undefined") {
		$("#twitter").loading()
		             .jsonp("http://search.twitter.com/search.json?callback=?&from=abaaso", "results[0].text")
		             .on("afterUpdate", function(){ twitter.tweet = this.innerText; });
	}
	else $("#twitter").loading().text(twitter.tweet);
}
