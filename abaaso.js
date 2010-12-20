/**
 * Copyright (c) 2010, avoidwork inc.
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *     * Redistributions of source code must retain the above copyright
 *       notice, this list of conditions and the following disclaimer.
 *     * Redistributions in binary form must reproduce the above copyright
 *       notice, this list of conditions and the following disclaimer in the
 *       documentation and/or other materials provided with the distribution.
 *     * Neither the name of the <organization> nor the
 *       names of its contributors may be used to endorse or promote products
 *       derived from this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
 * ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL <COPYRIGHT HOLDER> BE LIABLE FOR ANY
 * DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
 * ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 * SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

/**
 * abaaso
 *
 * abaaso provides a set of classes and object prototyping to ease the creation and maintenance of RESTful JavaScript applications.
 * HATEOAS can be implemented by setting abaaso.state.header which will trigger a transition (state change) if the header is part of an XHR response.
 * This requires standby listeners to be created on "ready" so the observer can replace the active listeners; otherwise an exception is thrown.
 *
 * See @link for the development roadmap.
 *
 * @author Jason Mulligan <jason.mulligan@avoidwork.com>
 * @link http://avoidwork.com/products/abaaso abaaso
 * @namespace
 * @version Beta
 */
var abaaso = function(){
	/**
	 * Array methods
	 *
	 * @class
	 */
	var array = {
		/**
		 * Finds the index of arg(s) in instance
		 *
		 * @param instance {array} An instance of the array to search
		 * @param arg {string} Comma delimited string of search values
		 * @returns {mixed} Integer or an array of integers representing the location of the arg(s)
		 */
		contains : function(instance, arg) {
			try {
				arg = (arg.toString().indexOf(",") > -1) ? arg.split(",") : arg;

				if (arg instanceof Array) {
					var indexes = [],
					          i = args.length;

					while (i--) {
						indexes[i] = instance.index(arg[i]);
					}

					return indexes;
				}
				else {
					return instance.index(arg);
				}
			}
			catch (e) {
				error(e);
				return undefined;
			}
		},

		/**
		 * Finds the index of arg in instance. Use contains() for multiple arguments
		 *
		 * @param instance {mixed} The entity to search
		 * @param arg {mixed} The argument to find (string or integer)
		 * @returns {integer} The position of item in ar
		 */
		index : function(instance, arg) {
			try {
				if (instance instanceof Array) {
					var i = instance.length;

					while (i--) {
						if (instance[i] == arg) {
							return i;
						}
					}

					return -1;
				}
				else {
					throw label.error.expectedArray;
				}
			}
			catch (e) {
				error(e);
				return -1;
			}
		},

		/**
		 * Removes arg from instance without destroying and re-creating instance
		 *
		 * @param instance {array} An instance of the array to use
		 * @param start {integer} The starting position
		 * @param end {integer} The ending position (optional)
		 * @returns {array} A scrubbed array
		 */
		remove : function(instance, start, end) {
			try {
				start = start || 0;
				var remaining = instance.slice((end || start)+1 || instance.length);
				instance.length = (start < 0) ? (instance.length + start) : start;
				return instance.push.apply(instance, remaining);
			}
			catch (e) {
				error(e);
				return undefined;
			}
		}
	};

	/**
	 * Cache for RESTful behavior
	 *
	 * @class
	 * @private
	 */
	var cache = {
		/**
		 * Array of URIs
		 */
		items : [],

		/**
		 * Returns the cached object {headers, response} of the URI or false
		 *
		 * @param uri {string} The URI/Identifier for the resource to retrieve from cache
		 * @param expire {boolean} [Optional] If 'false' the URI will not expire
		 * @returns {mixed} Returns the URI object {headers, response} or false
		 */
		get : function(uri, expire) {
			try {
				expire = (expire === false) ? false : true;

				if (this.items[uri] === undefined) {
					return false;
				}
				else {
					if (this.items[uri].headers !== undefined) {
						if (((this.items[uri].headers.Pragma !== undefined)
						    && (this.items[uri].headers.Pragma == "no-cache")
						    && (expire))
						    || ((this.items[uri].headers.Expires !== undefined)
							 && (new Date(this.items[uri].headers.Expires) < new Date())
							 && (expire))
						    || ((client.ms > 0)
							 && (expire)
							 && (this.items[uri].headers.Date !== undefined)
							 && (new Date(this.items[uri].headers.Date).setMilliseconds(new Date(this.items[uri].headers.Date).getMilliseconds() + client.ms) > new Date()))
						    || ((client.ms > 0)
							 && (expire)
							 && (new Date(this.items[uri].epoch).setMilliseconds(new Date(this.items[uri].epoch).getMilliseconds() + client.ms) > new Date()))) {
							delete this.items[uri];
							return false;
						}
						else {
							return this.items[uri];
						}
					}
					else {
						return this.items[uri];
					}
				}
			}
			catch (e) {
				error(e);
				return undefined;
			}
		},

		/**
		 * Sets, or updates an item in cache.items
		 *
		 * @param uri {string} The URI to set or update
		 * @param property {string} The property of the cached URI to set
		 * @param value {mixed} The value to set
		 */
		set : function(uri, property, value) {
			try {
				(this.items[uri] === undefined) ? this.items[uri] = {} : void(0);
				this.items[uri][property] = value;
			}
			catch (e) {
				error(e);
			}
		}
	};

	/**
	 * Calendar methods
	 *
	 * Override abaaso.calendar.date.pattern to change the localized pattern from ISO 8601
	 *
	 * @class
	 */
	var calendar = {
		/**
		 * Tracking object used to render the calendar
		 */
		date : {
			c           : new Date(),
			clear       : null,
			d           : null,
			destination : null,
			label       : null,
			n           : new Date(),
			p           : new Date(),
			pattern     : "yyyy/mm/dd"
		},

		/**
		 * Creates a calendar, which can act like a date picker
		 *
		 * @param target {string} Object.id value that called this function
		 * @param destination {string} Optional element.id that will receive the calendar value
		 * @param clear {boolean} Optional boolean for displaying optional Clear anchor in calendar header
		 */
		create : function(target, destination, clear) {
			try {
				if ((!$(target))
				    || ((destination !== undefined)
					&& (!$(destination)))) {
					throw label.error.elementNotFound;
				}

				var args = {id: "abaaso_calendar"},
				    o    = calendar.date;

				o.clear       = ((destination !== undefined) && (clear === undefined)) ? false : validate.bool(clear);
				o.destination = ((destination !== undefined) && ($(destination))) ? destination : null;
				o.c           = ((destination !== undefined) && ($(destination).value != "")) ? new Date($(destination).value) : o.c;

				$(target).blur();
				((o.destination !== null) && ($(destination).value == "Invalid Date"))? $(destination).clear() : void(0);
				($("abaaso_calendar")) ? el.destroy("abaaso_calendar") : void(0);

				if (o.destination !== null) {
					var pos = el.position(target);
					args.style = "top:" + pos[1] + "px;left:" + pos[0] + "px;z-index:9999;";
					el.create("div", args);
				}
				else {
					el.create("div", args, target);
				}

				if (!calendar.render("abaaso_calendar", o.c)) {
					$("abaaso_calendar").destroy();
					throw label.error.elementNotCreated;
				}
			}
			catch(e) {
				error(e);
			}
		},

		/**
		 * Creates a day div in the calendar
		 *
		 * @param target {string} Object.id value
		 * @param dateStamp {date} Date object
		 */
		day : function(target, dateStamp) {
			try {
				dateStamp = (dateStamp !== undefined) ? new Date(dateStamp) : null;

				if ((dateStamp != null)
				     && (!isNaN(dateStamp.getYear()))) {
					var o    = calendar.date.c,
					    args = {id: "href_day_" + dateStamp.getDate(), innerHTML: dateStamp.getDate()};

					args["class"] = ((dateStamp.getDate() == o.getDate())
						      && (dateStamp.getMonth() == o.getMonth())
						      && (dateStamp.getFullYear() == o.getFullYear())) ? "current" : "weekend";

					el.create("div", {id: "div_day_" + dateStamp.getDate(), "class": "day"}, target);
					el.create("a", args, "div_day_" + dateStamp.getDate());

					if (calendar.date.destination !== null) {
						abaaso.un("href_day_" + dateStamp.getDate(), "click");
						abaaso.on("href_day_" + dateStamp.getDate(), "click", function() {
							var date = new Date(abaaso.calendar.date.c),
							    day  = this.innerHTML.match(/^\d{1,2}$/);

							date.setDate(day[0]);
							abaaso.calendar.date.c = date;
							date = abaaso.calendar.format(date);
							($(abaaso.calendar.date.destination)) ? $(abaaso.calendar.date.destination).update({innerHTML: date, value: date}) : void(0);
							abaaso.destroy("abaaso_calendar");
							}, "href_day_" + dateStamp.getDate());
					}
				}
				else {
					el.create("div", {"class": "day"}, target);
				}
			}
			catch (e) {
				error(e);
			}
		},

		/**
		 * Gets the days in a month
		 *
		 * @param month {integer}
		 * @param year {integer}
		 * @returns {integer}
		 */
		days : function(month, year) {
			try {
				return (32 - new Date(year, month, 32).getDate());
			}
			catch (e) {
				error(e);
				return undefined;
			}
		},

		/**
		 * Returns a Date object as a string formatted as date.pattern
		 *
		 * @param dateStamp {object} Date object to return as a string
		 * @returns {string} Date object value in the date.pattern format
		 */
		format : function(dateStamp) {
			try {
				var output     = calendar.date.pattern,
				    outputDate = new Date(dateStamp);

				output = output.replace(/dd/,outputDate.getDate());
				output = output.replace(/mm/,outputDate.getMonth()+1);
				output = output.replace(/yyyy/,outputDate.getFullYear());

				return output;
			}
			catch (e) {
				error(e);
				return undefined;
			}
		},

		/**
		 * Renders the calendar in the target element
		 *
		 * @param target {string} Target object.id value
		 * @param dateStamp {mixed} Date to work with
		 */
		render : function(target, dateStamp) {
			try {
				if ($(target)) {
					$(target).clear();

					var o = calendar.date;
					o.c = new Date(dateStamp);
					o.p = new Date(dateStamp);
					o.n = new Date(dateStamp);
					o.d = calendar.days(o.c.getMonth(), o.c.getFullYear());

					switch (o.c.getMonth()) {
						case 0:
							o.p.setMonth(11);
							o.p.setFullYear(o.c.getFullYear()-1);
							o.n.setMonth(o.c.getMonth()+1);
							o.n.setFullYear(o.c.getFullYear());
							break;
						case 10:
							o.p.setMonth(o.c.getMonth()-1);
							o.p.setFullYear(o.c.getFullYear());
							o.n.setMonth(o.c.getMonth()+1);
							o.n.setFullYear(o.c.getFullYear());
							break;
						case 11:
							o.p.setMonth(o.c.getMonth()-1);
							o.p.setFullYear(o.c.getFullYear());
							o.n.setMonth(0);
							o.n.setFullYear(o.c.getFullYear()+1);
							break;
						default:
							o.p.setMonth(o.c.getMonth()-1);
							o.p.setFullYear(o.c.getFullYear());
							o.n.setMonth(o.c.getMonth()+1);
							o.n.setFullYear(o.c.getFullYear());
							break;
					}

					o.label = label.months[(o.c.getMonth()+1).toString()];
					el.create("div", {id: "calendarTop"}, target);

					if (o.clear) {
						el.create("a", {id: "calendarClear", innerHTML: label.common.clear}, "calendarTop");
						abaaso.un("calendarClear", "click");
						abaaso.on("calendarClear", "click", function() {
							var o = abaaso.calendar.date;
							((o.destination !== null) && $(o.destination)) ? $(o.destination).clear() : void(0);
							o.c = new Date();
							o.p = o.c;
							o.n = o.c;
							abaaso.destroy("abaaso_calendar");
							});
					}

					el.create("a", {id: "calendarClose", innerHTML: label.common.close}, "calendarTop");
					abaaso.un("calendarClose", "click");
					abaaso.on("calendarClose", "click", function() {
						abaaso.destroy("abaaso_calendar");
						});

					el.create("div", {id: "calendarHeader"}, target);

					el.create("a", {id: "calendarPrev", innerHTML: "&lt;"}, "calendarHeader");
					abaaso.un("calendarPrev", "click");
					abaaso.on("calendarPrev", "click", function() {
						abaaso.calendar.render("abaaso_calendar", abaaso.calendar.date.p);
						});

					el.create("span", {id: "calendarMonth", innerHTML: o.label+" "+dateStamp.getFullYear().toString()}, "calendarHeader");

					el.create("a", {id: "calendarNext", innerHTML: "&gt;"}, "calendarHeader");
					abaaso.un("calendarNext", "click");
					abaaso.on("calendarNext", "click", function() {
						abaaso.calendar.render("abaaso_calendar", abaaso.calendar.date.n);
						});

					el.create("div", {id: "calendarDays"}, target);

					dateStamp.setDate(1);

					var i    = null,
					    loop = dateStamp.getDay();

					for (i = 1; i <= loop; i++) {
						calendar.day("calendarDays");
					}

					loop = o.d;

					for (i = 1; i <= loop; i++) {
						calendar.day("calendarDays", dateStamp.setDate(i));
					}

					return true;
				}
				else {
					throw label.error.elementNotFound;
				}
			}
			catch (e) {
				error(e);
				return false;
			}
		}
	};

	/**
	 * Client properties and methods
	 *
	 * @class
	 */
	var client = {
		/**
		 * Public properties
		 */
		css3	: (function(){
				if ((this.chrome) && (parseInt(client.version) >= 6)) { return true; }
				if ((this.firefox) && (parseInt(client.version) >= 3)) { return true; }
				if ((this.ie) && (parseInt(client.version) >= 9)) { return true; }
				if ((this.opera) && (parseInt(client.version >= 9))) { return true; }
				if ((this.safari) && (parseInt(client.version >= 5))) { return true; }
				else { return false; }}),
		chrome	: (navigator.userAgent.toLowerCase().indexOf("chrome") > -1) ? true : false,
		firefox : (navigator.userAgent.toLowerCase().indexOf("firefox") > -1) ? true : false,
		ie	: (navigator.userAgent.toLowerCase().indexOf("msie") > -1) ? true : false,
		ms	: 0,
		opera	: (navigator.userAgent.toLowerCase().indexOf("opera") > -1) ? true : false,
		safari	: (navigator.userAgent.toLowerCase().indexOf("safari") > -1) ? true : false,
		version	: (function(){
				if (this.chrome) { return navigator.userAgent.replace(/(.*Chrome\/|Safari.*)/gi, ""); }
				if (this.firefox) { return navigator.userAgent.replace(/(.*Firefox\/)/gi, ""); }
				if (this.ie) { return navigator.userAgent.replace(/(.*MSIE|;.*)/gi, ""); }
				if (this.opera) { return navigator.userAgent.replace(/(.*Opera\/|\(.*)/gi, ""); }
				if (this.safari) { return navigator.userAgent.replace(/(.*Version\/|Safari.*)/gi, ""); }
				else { return parseInt(navigator.appVersion); }
				}),

		/**
		 * Sends a DELETE to the URI
		 *
		 * @param uri {string} URI to submit to
		 * @param handler {function} A handler function to execute once a response has been received
		 */
		del : function(uri, handler) {
			try {
				if ((uri == "")
				    || (!handler instanceof Function)) {
					throw label.error.invalidArguments;
				}

				client.request(uri, handler, "DELETE");
			}
			catch (e) {
				error(e);
			}
		},

		/**
		 * Sends a GET to the URI
		 *
		 * @param uri {string} URI to submit to
		 * @param handler {function} A handler function to execute once a response has been received
		 */
		get : function(uri, handler) {
			try {
				if ((uri == "")
				    || (!handler instanceof Function)) {
					throw label.error.invalidArguments;
				}

				var response = cache.get(uri);
				(!response) ? client.request(uri, handler, "GET") : handler(response);
			}
			catch (e) {
				error(e);
			}
		},

		/**
		 * Sends a PUT to the URI
		 *
		 * @param uri {string} URI submit to
		 * @param handler {function} A handler function to execute once a response has been received
		 * @param {args} PUT variables to include
		 */
		put : function(uri, handler, args) {
			try {
				if ((uri == "")
				    || (!handler instanceof Function)
				    || (args == "")) {
					throw label.error.invalidArguments;
				}

				client.request(uri, handler, "PUT", args);
			}
			catch (e) {
				error(e);
			}
		},

		/**
		 * Sends a POST to the URI
		 *
		 * @param uri {string} URI submit to
		 * @param handler {function} A handler function to execute once a response has been received
		 * @param {args} POST variables to include
		 */
		post : function(uri, handler, args) {
			try {
				if ((uri == "")
				    || (!handler instanceof Function)
				    || (args == "")) {
					throw label.error.invalidArguments;
				}

				client.request(uri, handler, "POST", args);
			}
			catch (e) {
				error(e);
			}
		},

		/**
		 * Creates an XmlHttpRequest to a URI
		 *
		 * @param uri {string} The resource to interact with
		 * @param handler {function} A handler function to execute when an appropriate response been received
		 * @param type {string} The type of request
		 * @param args {mixed} Data to append to the request
		 */
		request : function(uri, handler, type, args) {
			var xmlHttp = false;

			if (window.XMLHttpRequest) {
				xmlHttp = new XMLHttpRequest();
			}
			else if (window.ActiveXObject) {
				try {
					xmlHttp = new ActiveXObject("Msxml2.XMLHTTP");
				}
				catch (e1) {
					try {
						xmlHttp = new ActiveXObject("Microsoft.XMLHTTP");
					}
					catch (e2) {
						error(e2);
					}
				}
			}

			try {
				switch(type.toLowerCase()) {
					case "delete":
					case "get":
						xmlHttp.onreadystatechange = function() { client.response(xmlHttp, uri, handler); };
						(type.toLowerCase() == "delete") ? xmlHttp.open("DELETE", uri, true) : xmlHttp.open("GET", uri, true);
						xmlHttp.send(null);
						break;
					case "post":
					case "put":
						xmlHttp.onreadystatechange = function() { client.response(xmlHttp, uri, handler); };
						(type.toLowerCase() == "post") ? xmlHttp.open("POST", uri, true) : xmlHttp.open("PUT", uri, true);
						(xmlHttp.overrideMimeType) ? xmlHttp.overrideMimeType("text/html") : void(0);
						xmlHttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
						xmlHttp.setRequestHeader("Content-length", args.length);
						xmlHttp.setRequestHeader("Connection", "close");
						xmlHttp.send(args);
						break;
				}
			}
			catch(e3) {
				error(e3);
			}
		},

		/**
		 * Receives and caches the URI response
		 *
		 * Headers are cached, if an expiration is set it will be used to control the local cache
		 *
		 * @param xmlHttp {object} XMLHttp object
		 * @param uri {string} The URI.value to cache
		 * @param handler {function} A handler function to execute once a response has been received
		 */
		response : function(xmlHttp, uri, handler) {
			try {
				if (xmlHttp.readyState == 2) {
					var headers = xmlHttp.getAllResponseHeaders().split("\n"),
					    i       = null,
					    loop    = headers.length,
					    items   = {};

					for (i = 0; i < loop; i++) {
						if (headers[i] != "") {
							var header    = new String(headers[i]),
							    value     = header.substr((header.indexOf(':') + 1), header.length).replace(/\s/, "");
							header        = header.substr(0, header.indexOf(':')).replace(/\s/, "");
							items[header] = value;
						}
					}

					cache.set(uri, "headers", items);
				}
				else if (xmlHttp.readyState == 4) {
					if ((xmlHttp.status == 200)
					    && (xmlHttp.responseText != "")) {
						var state = null,
						        o = abaaso.state;

						cache.set(uri, "epoch", new Date());
						cache.set(uri, "response", xmlHttp.responseText);

						uri = cache.get(uri, false);

						if ((o.header !== null)
						    && (state = uri.headers[o.header]) && (state !== undefined)) {
							o.previous = o.current;
							o.current  = state;
							((o.previous !== null)
							 && (o.current !== null)) ? observer.replace("abaaso", state, o.previous, o.current, o.current) : void(0);
							observer.fire("abaaso", state);
						}

						(handler !== undefined) ? handler(uri) : void(0);
					}
					else {
						throw label.error.serverError;
					}
				}
			}
			catch (e) {
				error(e);
			}
		},

		/**
		 * Renders a loading icon in a target element
		 *
		 * @param id {string} Target object.id value
		 */
		spinner : function(id) {
			try {
				if (!window["abaaso_spinner"]) {
					window["abaaso_spinner"] = new Image();
					window["abaaso_spinner"].src = abaaso.spinner.url;
				}

				if (!$(id + "_" + label.common.loading.toLocaleLowerCase())) {
					el.create("img", {
						alt: label.common.loading,
						id: id + "_" + label.common.loading.toLocaleLowerCase(),
						src: window["abaaso_spinner"].src,
						"class": "spinner"
						}, id);
				}
			}
			catch (e) {
				error(e);
			}
		}
	};

	/**
	 * Element methods
	 *
	 * @class
	 */
	var el = {
		/**
		 * Clears an object's innerHTML, or resets it's state
		 *
		 * @param id {string} Target object.id value
		 */
		clear : function(id) {
			try {
				if ($(id)) {
					switch (typeof $(id)) {
						case "form":
							$(id).reset();
							break;
						case "object":
							$(id).update({innerHTML: "", value: ""});
							break;
						default:
							$(id).update({innerHTML: ""});
							break;
					}
				}
				else {
					throw label.error.elementNotFound;
				}
			}
			catch (e) {
				error(e);
			}
		},

		/**
		 * Creates an element in document.body or a target element
		 *
		 * @param type {string} Type of element to create
		 * @param args {object} Collection of properties to apply to the new element
		 * @param id {string} [Optional] Target id value to add element to
		 */
		create : function(type, args, id) {
			try {
				if (args instanceof Object) {
					var obj = document.createElement(type);
					el.update(obj, args);
					($(id)) ? $(id).appendChild(obj) : document.body.appendChild(obj);
				}
				else {
					throw label.error.expectedObject;
				}
			}
			catch (e) {
				error(e);
			}
		},

		/**
		 * Destroys an element
		 *
		 * @param arg {string} Comma delimited string of target element.id values
		 */
		destroy : function(arg) {
			try {
				var args = arg.split(","),
				       i = args.length;

				while (i--) {
					var instance = $(args[i]);
					((instance !== undefined) && (instance != null)) ? instance.parentNode.removeChild(instance) : void(0);
				}
			}
			catch(e) {
				error(e);
			}
		},

		/**
		 * Returns the ID of the element that triggered the event
		 *
		 * @param e {event} The event arguement sent to the listener
		 * @param obj {object} The element whose listener called this function
		 * @returns {string} The id of the element that triggered the event
		 */
		eventID : function(e, obj) {
			return (window.event) ? window.event.srcElement.id : obj.id;
		},

		/**
		 * Finds the position of an element
		 *
		 * @param id {string} Target object.id value
		 * @returns {array} An array containing the render position of the element
		 */
		position : function(id) {
			var left = null,
			     top = null,
			     obj = $(id);

			if (obj.offsetParent) {
				left = obj.offsetLeft;
				top  = obj.offsetTop;

				while (obj = obj.offsetParent) {
					left += obj.offsetLeft;
					top  += obj.offsetTop;
				}
			}

			return [left, top];
		},

		/**
		 * Updates an object or element
		 *
		 * @param obj {mixed} An instance of an object, or a target object.id value
		 * @param args {object} A collection of properties
		 */
		update : function(obj, args) {
			try {
				if (!args instanceof Object) {
					throw label.error.expectedObject;
				}

				obj = (typeof obj == "object") ? obj : $(obj);

				if (obj) {
					for (var i in args) {
						switch(i) {
							case "class":
								((client.ie) && (client.version < 8)) ? obj.setAttribute("className", args[i]) : obj.setAttribute("class", args[i]);
								break;
							case "innerHTML":
							case "type":
							case "src":
								obj[i] = args[i];
								break;
							case "opacity":
								obj.opacity(args[i]);
								break;
							default:
								obj.setAttribute(i, args[i]);
								break;
						}
					}
				}
				else {
					throw label.error.elementNotFound;
				}
			}
			catch (e) {
				error(e);
			}
		}
	};

	/**
	 * Effects methods
	 *
	 * @class
	 */
	var fx = {
		/**
		 * Bounces Target at it's current position
		 *
		 * @param id {string} Target object.id value
		 * @param ms {int} Milliseconds for bounce to take
		 * @param height {int} The maximum height of the bounce
		 * @todo implement this!
		 */
		bounce : function(id, ms, height) {
			void(0);
		},

		/**
		 * Simulates the Target falling to a position
		 *
		 * @param id {string} Target object.id value
		 * @param pos {int} The X co-ordinate to end the fall
		 * @param ms {int} Milliseconds for bounce to take
		 * @todo implement this!
		 */
		fall : function (id, pos, ms) {
			void(0);
		},

		/**
		 * Changes an element's opacity to the supplied value
		 *
		 * @param obj {mixed} Instance of an object, or the target object.id value
		 * @param opacity {integer} The opacity value to set
		 * @returns {integer} The opacity value of the element
		 */
		opacity : function(obj, opacity) {
			try {
				obj = (typeof obj == "object") ? obj : $(obj);

				if (obj !== undefined) {
					if (opacity !== undefined) {
						(client.ie) ? obj.style.filter = "alpha(opacity=" + opacity + ")" : obj.style.opacity = (parseInt(opacity)/100);
						return parseInt(opacity);
					}
					else {
						return (client.ie) ? parseInt(obj.style.filter.toString().replace(/(.*\=|\))/gi, "")) : parseInt(obj.style.opacity);
					}
				}
				else {
					return undefined;
				}
			}
			catch (e) {
				error(e);
				return undefined;
			}
		},

		/**
		 * Changes an object's opacity from the start value to the end value, transition speed is based on the ms argument
		 *
		 * @param id {string} Target object.id value
		 * @param start {integer} Opacity start value
		 * @param end {integer} Opacity end value
		 * @param ms {integer} Milliseconds for transition to take
		 */
		opacityChange : function(id, start, end, ms) {
			try {
				var fn    = null,
				    speed = Math.round(ms/100),
				    timer = 0,
				    i     = null;

				if (start > end) {
					for (i = start; i >= end; i--) {
						setTimeout("$(\"" + id + "\").opacity(" + i + ")", (timer*speed));
						timer++;
					}
				}
				else {
					for (i = start; i <= end; i++) {
						setTimeout("$(\"" + id + "\").opacity(" + i + ")", (timer*speed));
						timer++;
					}
				}
			}
			catch (e) {
				error(e);
			}
		},

		/**
		 * Shifts an object's opacity, transition speed is based on the ms argument
		 *
		 * @param id {string} Target object.id value
		 * @param ms {integer} Milliseconds for transition to take
		 */
		opacityShift : function(id, ms) {
			($(id).opacity() === 0) ? this.opacityChange(id, 0, 100, ms) : this.opacityChange(id, 100, 0, ms);
		},

		/**
		 * Slides an object to a position
		 *
		 * @param id {string} Target object.id value
		 * @param ms {integer} Milliseconds for transition to take
		 * @param pos {array} An array of co-ordinates [X,Y]
		 * @param elastic {integer} [Optional] The elastic force to apply when Target reaches destination [0-100]
		 * @todo implement this!
		 */
		slide : function(id, ms, pos, elastic) {
			try {
				if ((id === undefined)
				    || (!$(id))
				    || (NaN(ms))
				    || (!pos instanceof Array)
				    || (NaN(pos[0]))
				    || (NaN(pos[1]))) {
					throw label.error.invalidArguments;
				}

				elastic = elastic || 0;
			}
			catch (e) {
				error(e);
			}
		}
	};

	/**
	 * Number methods
	 *
	 * @class
	 */
	var number = {
		/**
		 * Returns true if the number is even
		 *
		 * @param arg {integer}
		 * @returns {boolean}
		 */
		even : function(arg) {
			try {
				return (((parseInt(arg) / 2).toString().indexOf(".")) > -1) ? false : true;
			}
			catch (e) {
				error(e);
				return undefined;
			}
		},

		/**
		 * Returns true if the number is odd
		 *
		 * @param arg {integer}
		 * @returns {boolean}
		 */
		odd : function(arg) {
			try {
				return (((parseInt(arg) / 2).toString().indexOf(".")) > -1) ? true : false;
			}
			catch (e) {
				error(e);
				return undefined;
			}
		}
	};

	/**
	 * JSON methods
	 *
	 * @class
	 */
	var json = {
		/**
		 * Decodes the argument into an object
		 *
		 * @param arg {string} The string to parse
		 */
		decode : function(arg) {
			try {
				return JSON.parse(arg);
			}
			catch (e) {
				error(e);
				return undefined;
			}
		},

		/**
		 * Encodes a string, array or object to a JSON string
		 *
		 * @param arg {mixed} The entity to encode
		 */
		encode : function(arg) {
			try {
				return JSON.stringify(arg);
			}
			catch (e) {
				error(e);
				return undefined;
			}
		}
	};

	/**
	 * Labels for localization
	 *
	 * Override this with another language pack
	 *
	 * @class
	 */
	var label = {
		/**
		 * Error messages
		 */
		error : {
			databaseNotOpen       : "Failed to open the Database, possibly exceeded Domain quota.",
			databaseNotSupported  : "Client does not support local database storage.",
			databaseWarnInjection : "Possible SQL injection in database transaction, use the &#63; placeholder.",
			elementNotCreated     : "Could not create the Element.",
			elementNotFound       : "Could not find the Element.",
			expectedArray         : "Expected an Array.",
			expectedArrayObject   : "Expected an Array or Object.",
			expectedBoolean       : "Expected a Boolean value.",
			expectedObject        : "Expected an Object.",
			invalidArguments      : "One or more arguments is invalid.",
			invalidDate           : "Invalid Date.",
			invalidFields         : "The following required fields are invalid: ",
			serverError           : "A server error has occurred."
		},

		/**
		 * Common labels
		 */
		common : {
			back    : "Back",
			cancel  : "Cancel",
			clear   : "Clear",
			close   : "Close",
			cont    : "Continue",
			del     : "Delete",
			edit    : "Edit",
			find    : "Find",
			gen     : "Generate",
			go      : "Go",
			loading : "Loading",
			next    : "Next",
			login   : "Login",
			ran     : "Random",
			save    : "Save",
			search  : "Search",
			submit  : "Submit"
		},

		/**
		 * Months
		 */
		months : {
			"1"  : "January",
			"2"  : "February",
			"3"  : "March",
			"4"  : "April",
			"5"  : "May",
			"6"  : "June",
			"7"  : "July",
			"8"  : "August",
			"9"  : "September",
			"10" : "October",
			"11" : "November",
			"12" : "December"
		}
	};

	/**
	 * Observer for events
	 *
	 * @class
	 */
	var observer = {
		/**
		 * Array of event listeners
		 */
		listeners : [],

		/**
		 * Adds a listener to an object
		 *
		 * @param obj {mixed} The object.id or instance of object firing the event
		 * @param event {string} The event being fired
		 * @param listener {function} The event listener
		 * @param scope {string} [Optional / Recommended] The id of the object or element to be set as 'this'
		 * @param id {string} [Optional / Recommended] The id for the listener
		 * @param standby {boolean} [Optional] Add to the standby collection; the id parameter is [Required] if true
		 */
		add : function(obj, event, listener, scope, id, standby) {
			try {
				obj     = (obj instanceof Object) ? obj.id : obj;
				standby = ((standby !== undefined) && (standby === true)) ? true : false;

				if ((obj === undefined)
				    || (event === undefined)
				    || (listener === undefined)
				    || (!listener instanceof Function)
				    || ((standby)
					&& (id === undefined))) {
					throw label.error.invalidArguments;
				}

				var item = {};
				item.fn  = listener;
				((scope !== undefined) && (scope !== null)) ? item.scope = scope : void(0);

				(observer.listeners[obj] === undefined) ? observer.listeners[obj] = [] : void(0);
				(observer.listeners[obj][event] === undefined) ? observer.listeners[obj][event] = [] : void(0);
				(observer.listeners[obj][event]["active"] === undefined) ? observer.listeners[obj][event]["active"] = [] : void(0);

				if (!standby) {
					(id !== undefined) ?
					 observer.listeners[obj][event]["active"][id] = item :
					 observer.listeners[obj][event]["active"].push(item);

					($(obj)) ? (($(obj).addEventListener) ?
						    $(obj).addEventListener(event, function(){ abaaso.fire(obj, event); }, false) :
						    $(obj).attachEvent("on" + event, function(){ abaaso.fire(obj, event); }))
					: void(0);
				}
				else {
					(observer.listeners[obj][event]["standby"] === undefined) ? observer.listeners[obj][event]["standby"] = [] : void(0);
					observer.listeners[obj][event]["standby"][id] = item;
				}
			}
			catch (e) {
				error(e);
			}
		},

		/**
		 * Fires an event
		 *
		 * @param obj {mixed} The object.id or instance of object firing the event
		 * @param event {string} The event being fired
		 */
		fire : function(obj, event) {
			try {
				obj = (obj instanceof Object) ? obj.id : obj;

				if ((obj === undefined)
				    || (event === undefined)) {
					throw label.error.invalidArguments;
				}

				var listeners = (observer.listeners[obj] !== undefined) ?
					((observer.listeners[obj][event] !== undefined) ?
					 ((observer.listeners[obj][event]["active"] !== undefined) ?
					  observer.listeners[obj][event]["active"] : []) : []) : [];

				for (var i in listeners) {
					if (listeners[i].fn) {
						if (listeners[i].scope !== undefined) {
							var scope = ($(listeners[i].scope)) ? $(listeners[i].scope) : listeners[i].scope,
							    fn    = listeners[i]["fn"];
							fn.call(scope);
						}
						else {
							listeners[i]["fn"]();
						}
					}
				}
			}
			catch (e) {
				error(e);
			}
		},

		/**
		 * Lists the active and standby listeners for an object event
		 *
		 * @param obj {mixed} The object.id or instance of object firing the event
		 * @param event {string} The event being fired
		 */
		list : function(obj, event) {
			try {
				obj = (obj instanceof Object) ? obj.id : obj;

				if ((obj === undefined)
				    || (event === undefined)) {
					throw label.error.invalidArguments;
				}

				return (observer.listeners[obj] !== undefined) ? ((observer.listeners[obj][event] !== undefined) ? observer.listeners[obj][event] : []) : [];
			}
			catch (e) {
				error(e);
				return undefined;
			}
		},

		/**
		 * Removes an event listener, or listeners
		 *
		 * @param obj {mixed} The object.id or instance of object firing the event
		 * @param event {string} The event being fired
		 * @param id {string} [Optional] The identifier for the listener
		 */
		remove : function(obj, event, id) {
			try {
				obj = (obj instanceof Object) ? obj.id : obj;

				if ((obj === undefined)
				    || (event === undefined)
				    || (observer.listeners[obj] === undefined)
				    || (observer.listeners[obj][event] === undefined)) {
					return;
				}
				else {
					if (id === undefined) {
						delete observer.listeners[obj][event];
						($(obj)) ? (($(obj).removeEventListener) ?
							    $(obj).removeEventListener(event, function(){ abaaso.fire(obj, event); }, false) :
							    $(obj).removeEvent("on" + event, function(){ abaaso.fire(obj, event); }))
						: void(0);
					}
					else if ((id !== undefined)
						 && (typeof id == String)
						 && (observer.listeners[obj][event][id] !== undefined)) {
						delete observer.listeners[obj][event][id];
					}
				}
			}
			catch (e) {
				error (e);
			}
		},

		/**
		 * Replaces an active listener, moving it to the standby collection
		 *
		 * @param obj {mixed} The object.id or instance of object firing the event
		 * @param event {string} The event
		 * @param id {string} The identifier for the active listener
		 * @param sId {string} The identifier for the new standby listener
		 * @param listener {mixed} The standby id (string), or the new event listener (function)
		 */
		replace : function(obj, event, id, sId, listener) {
			try {
				obj = (obj instanceof Object) ? obj.id : obj;

				if ((obj === undefined)
				    || (event === undefined)
				    || (id === undefined)
				    || (sId === undefined)
				    || (observer.listeners[obj] === undefined)
				    || (observer.listeners[obj][event] === undefined)
				    || (observer.listeners[obj][event]["active"] === undefined)
				    || (observer.listeners[obj][event]["active"][id] === undefined)) {
					throw label.error.invalidArguments;
				}

				(observer.listeners[obj][event]["standby"] === undefined) ? observer.listeners[obj][event]["standby"] = [] : void(0);

				if (typeof(listener) == "string")
				{
					if ((observer.listeners[obj][event]["standby"][listener] === undefined)
					    || (observer.listeners[obj][event]["standby"][listener]["fn"] === undefined)) {
						throw label.error.invalidArguments;
					}
					else {
						listener = observer.listeners[obj][event]["standby"][listener]["fn"];
					}
				}
				else if (!listener instanceof Function) {
					throw label.error.invalidArguments;
				}

				observer.listeners[obj][event]["standby"][sId] = {"fn" : observer.listeners[obj][event]["active"][id]["fn"]};
				observer.listeners[obj][event]["active"][id]   = {"fn" : listener};
			}
			catch (e) {
				error(e);
			}
		}
	};

	/**
	 * Utility methods
	 *
	 * @class
	 */
	var utility = {
		/**
		 * Returns an instance or array of instances
		 *
		 * @param arg {string} Comma delimited string of target element.id values
		 * @returns {mixed} instances Instance or Array of Instances of elements
		 */
		$ : function(arg) {
			try {
				arg = new String(arg);
				arg = (arg.indexOf(",") > -1) ? arg.split(",") : arg;

				if (arg instanceof Array) {
					var instances = [],
					    i         = arg.length;

					while (i--) {
						instances.push($(arg[i]));
					}

					return instances;
				}

				return document.getElementById(arg);
			}
			catch (e) {
				error(e);
				return undefined;
			}
		},

		/**
		 * Encodes a string to a DOM friendly ID
		 *
		 * @param id {string} The object.id value to encode
		 * @returns {string} Returns a lowercase stripped string
		 */
		domID : function(id) {
			try {
				return id.replace(/(\&|,|(\s)|\/)/gi,"").toLowerCase();
			}
			catch (e) {
				error(e);
				return undefined;
			}
		},

		/**
		 * Error handling
		 *
		 * @param e {mixed} Error object or message to display.
		 */
		error : function(e) {
			var err = new Error(e);
			((client.ie) || (console === undefined)) ? alert(err.description) : console.error(err);
			(error.events === undefined) ? error.events = [] : void(0);
			error.events.push(err);
		}
	};

	/**
	 * Validation methods and patterns
	 *
	 * @class
	 */
	var validate = {
		/**
		 * Regular expression patterns to test against
		 */
		pattern : {
			domain   : /^([a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?\.)*[a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?$/,
			ip       : /^((25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})\.){3}(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})$/,
			integer  : /(^-?\d\d*$)/,
			email    : /^([0-9a-zA-Z]+([_.-]?[0-9a-zA-Z]+)*@[0-9a-zA-Z]+[0-9,a-z,A-Z,.,-]*(.){1}[a-zA-Z]{2,4})+$/,
			number   : /(^-?\d\d*\.\d*$)|(^-?\d\d*$)|(^-?\.\d\d*$)/,
			notEmpty : /\S/,
			phone    : /^\([1-9]\d{2}\)\s?\d{3}\-\d{4}$/,
			string   : /\w/
		},

		/**
		 * Returns the supplied argument, or false
		 *
		 * @param arg {boolean}
		 * @returns {boolean}
		 */
		bool : function(arg) {
			try {
				switch (arg) {
					case true:
					case false:
						return arg;
					default:
						return false;
				}
			}
			catch (e) {
				error(e);
				return false;
			}
		},

		/**
		 * Validates args based on the type or pattern specified
		 *
		 * @param args {object} An object to test {id: [test || pattern]}
		 * @returns {object} An object containing validation status and invalid instances
		 */
		test : function(args) {
			try {
				var exception = false,
				    invalid   = [],
				    pattern   = validate.pattern,
				    value     = null;

				for (var i in args) {
					value = ($(i).value) ? $(i).value : $(i).innerHTML;
					switch (args[i]) {
						case "boolean":
							if (!validate.bool(value)) {
								invalid.push(i);
								exception = true;
							}
							break;
						case "date":
							value = new String(value);
							if ((!pattern.notEmpty.test(value))
							    || (!new Date(value))) {
								invalid.push(i);
								exception = true;
							}
							break;
						case "domainip":
							value = new String(value);
							if ((!pattern.domain.test(value))
							    || (!pattern.ip.test(value))) {
								invalid.push(i);
								exception = true;
							}
							break;
						default:
							value = new String(value);
							var p = (pattern[args[i]]) ? pattern[args[i]] : args[i];
							if (!p.test(value)) {
								invalid.push(i);
								exception = true;
							}
							break;
					}
				}

				return {pass: !exception, invalid: invalid};
			}
			catch (e) {
				error(e);
				return {pass: false, invalid: {}};
			}
		}
	};

	/**
	 * Declaring private global instances
	 */
	var $     = utility.$,
	    error = utility.error;

	/**
	 * Returned to the client
	 *
	 * @constructor
	 */
	return {
		/**
		 * Properties
		 */
		id              : 'abaaso',
		ready           : false,

		/**
		 * Methods
		 */
		$               : utility.$,
		clear           : el.clear,
		create          : el.create,
		del             : client.del,
		destroy         : el.destroy,
		domID           : utility.domID,
		error           : utility.error,
		fire            : observer.fire,
		init            : function() {
			abaaso.ready = true;
			abaaso.fire("abaaso", "ready");
			abaaso.un("ready");
			delete abaaso.init;
			},
		get             : client.get,
		position        : el.position,
		post            : client.post,
		put             : client.put,
		update          : el.update,

		/**
		 * Classes
		 */
		array           : array,
		calendar        : calendar,
		client          : {
			// Properties
			css3    : client.css3,
			chrome  : client.chrome,
			firefox : client.firefox,
			ie      : client.ie,
			ms      : client.ms,
			opera   : client.opera,
			safari  : client.safari,
			version : client.version,

			// Methods
			del     : client.del,
			get     : client.get,
			post    : client.post,
			put     : client.put
			},
		el              : el,
		fx              : fx,
		json            : json,
		label           : label,
		listener        : {
			add     : observer.add,
			list    : observer.list,
			remove  : observer.remove,
			replace : observer.replace
			},
		number          : number,
		state           : {
			current : null,
			header  : null,
			previous: null
			},
		spinner         : {
			create  : client.spinner,
			url     : null
			},
		validate        : validate
	};
}();

/**
 * Declaring a global helper
 */
var $ = function(arg) { return abaaso.$(arg); };

/**
 * Putting observer methods on the singleton
 */
abaaso.on = function(event, listener, scope, id, standby) { abaaso.listener.add(this, event, listener, scope, id, standby); };
abaaso.un = function(event, id) { abaaso.listener.remove(this, event, id); };

/**
 * Prototyping with abaaso
 */
methods = [
	{name: "clear", fn: function() { abaaso.clear(this.id); }},
	{name: "fire", fn: function(event) { abaaso.fire(this.id, event); }},
	{name: "on", fn: function(event, listener, scope, id, standby) { abaaso.listener.add(this.id, event, listener, scope, id, standby); }},
	{name: "un", fn: function(event, id) { abaaso.listener.remove(this.id, event, id); }}
	];

i = methods.length;

while (i--) {
	Array.prototype[methods[i].name]   = methods[i].fn;
	Element.prototype[methods[i].name] = methods[i].fn;
	String.prototype[methods[i].name]  = methods[i].fn;
}

delete i;
delete methods;

Array.prototype.contains       = function(arg) { abaaso.array.contains(this, arg); };
Array.prototype.index          = function(arg) { abaaso.array.index(this, arg); };
Array.prototype.remove         = function(arg) { abaaso.array.remove(this, arg); };
Element.prototype.bounce       = function(ms, height) { abaaso.fx.bounce(this.id, ms, height); };
Element.prototype.destroy      = function() { abaaso.destroy(this.id); };
Element.prototype.domID        = function() { return abaaso.domID(this.id); };
Element.prototype.fall         = function(pos, ms) { abaaso.fx.bounce(this.id, pos, ms); };
Element.prototype.fire         = function(event) { abaaso.fire(this.id, event); };
Element.prototype.opacity      = function(arg) { return abaaso.fx.opacity(this, arg); };
Element.prototype.opacityShift = function(arg) { abaaso.fx.opacityShift(this.id, arg); };
Element.prototype.slide        = function(ms, pos, elastic) { abaaso.fx.slide(this.id, ms, pos, elastic); };
Element.prototype.update       = function(args) { abaaso.update(this.id, args); };
Number.prototype.even          = function() { return abaaso.number.even(this); };
Number.prototype.odd           = function() { return abaaso.number.odd(this); };
String.prototype.domID         = function() { return abaaso.domID(this); };
String.prototype.trim          = function() { return this.replace(/^\s+|\s+$/g, "") };

/**
 * Setting events
 */
if ((abaaso.client.chrome) || (abaaso.client.firefox)) {
	window.addEventListener("DOMContentLoaded", function(){
		abaaso.init();
	}, false);
}
else if (abaaso.client.safari) {
	abaaso.ready = setInterval(function(){
		if (/loaded|complete/.test(document.readyState)) {
			clearInterval(abaaso.ready);
			abaaso.init();
		}}, 10);
}
else {
	abaaso.ready = setInterval(function(){
		if (document.getElementById) {
			clearInterval(abaaso.ready);
			abaaso.init();
		}}, 10);
}

/**
 * Registering Window events
 */
window.onload   = function() { abaaso.fire("abaaso", "render"); }
window.onresize = function() { abaaso.fire("abaaso", "resize"); }
