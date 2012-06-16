/**
 * Copyright (c) 2012, Jason Mulligan <jason.mulligan@avoidwork.com>
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *     * Redistributions of source code must retain the above copyright
 *       notice, this list of conditions and the following disclaimer.
 *     * Redistributions in binary form must reproduce the above copyright
 *       notice, this list of conditions and the following disclaimer in the
 *       documentation and/or other materials provided with the distribution.
 *     * Neither the name of abaaso.datalist nor the
 *       names of its contributors may be used to endorse or promote products
 *       derived from this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
 * ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL JASON MULLIGAN BE LIABLE FOR ANY
 * DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
 * ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 * SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

/**
 * abaaso.datalist
 * 
 * DataList module
 *
 * @author Jason Mulligan <jason.mulligan@avoidwork.com>
 * @link http://avoidwork.com
 * @module abaaso.datalist
 * @requires abaaso 2.1.7
 * @version 1.0.5
 */
(function (global) {
	"use strict";

	var datalist, fn;

	/**
	 * DataList Factory
	 *
	 * Options: callback    Function to execute after creating a templated record display, parameter is the new Element
	 *          filter      Object describing key:value pairs to filter the list on ({property: "someValue"}), accepts comma delimited values
	 *          placeholder String to use in lieu of an undefined record (data) property
	 *          start       Start position for pagination
	 *          end         End position for pagination
	 *           
	 * @param  {Object} target   Element to receive the DataList
	 * @param  {Object} store    Data store to feed the DataList
	 * @param  {Mixed}  template Record field, template ($.tpl), or String, e.g. "<p>this is a {{field}} sample.</p>", fields are marked with {{ }}
	 * @param  {Object} options  Optional parameters to set on the DataList
	 * @return {Object}          DataList instance
	 */
	datalist = function (target, store, template, options) {
		var $    = global[abaaso.aliased],
		    self = this,
		    element;

		if (!(target instanceof Element) || typeof store !== "object" || !/string|object/.test(typeof template)) throw Error($.label.error.invalidArguments);

		element          = target.create("ul", {"class": "list"});
		this.element     = element;
		this.end         = null;
		this.callback    = null;
		this.filter      = null;
		this.placeholder = "";
		this.order       = "";
		this.ready       = false;
		this.template    = template;
		this.sensitivity = "ci";
		this.start       = null;
		this.store       = store;
		this.store.parentNode.on("afterDataSync",   function ()  { this.refresh(); }, "refresh-" + element.id, this);
		this.store.parentNode.on("afterDataDelete", function (r) { $("#" + element.id + " li[data-key='" + r.key + "']").destroy(); }, "delete-" + element.id, this);
		if (options instanceof Object) $.iterate(options, function (v, k) { self[k] = v; });
		this.refresh();
		return this;
	};

	/**
	 * Refreshes element
	 * 
	 * Events: beforeDataListRefresh, afterDataListRefresh
	 * 
	 * @return {Object} DataList instance
	 */
	datalist.prototype.refresh = function () {
		var $        = global[abaaso.aliased],
		    element  = this.element,
		    template = (typeof this.template === "object"),
		    key      = (!template && String(this.template).replace(/{{|}}/g, "") === this.store.key),
		    consumed = [],
		    items    = [],
		    self     = this,
		    attr     = ($.encode(this.template).indexOf("data-key") < 0),
		    callback = (typeof this.callback === "function"),
		    cleanup  = /{{.*}}/g,
		    regex    = new RegExp(),
		    registry = [], // keeps track of records in the list (for filtering)
		    fn;

		if (!this.ready) {
			this.ready = true;
			this.store.parentNode.on("afterDataSet", function (r)  { this.refresh(); }, "set-" + element.id, this);
		}

		this.store.parentNode.fire("beforeDataListRefresh");

		// Creating templates for the html rep
		if (!template) fn = function (i) {
			var html = String(self.template);

			html = html.replace("{{" + self.store.key + "}}", i.key)
			$.iterate(i.data, function (v, k) {
				regex.compile("{{" + k + "}}", "g");
				html = html.replace(regex, v);
			});
			return {li: html.replace(cleanup, self.placeholder)};
		}
		else fn = function (i) {
			var obj = $.encode(self.template);

			obj = obj.replace("{{" + self.store.key + "}}", i.key)
			$.iterate(i.data, function (v, k) {
				regex.compile("{{" + k + "}}", "g");
				obj = obj.replace(regex, $.encode(v).replace(/(^")|("$)/g, "")); // stripping first and last " to concat to valid JSON
			});
			obj = $.decode(obj.replace(cleanup, self.placeholder));
			return {li: obj};
		};

		// Consuming records based on sort
		consumed = this.order.isEmpty() ? this.store.get() : this.store.sort(this.order, false, this.sensitivity);
		if (typeof this.start === "number" && typeof this.end === "number") consumed = consumed.range(this.start, this.end);

		// Processing (filtering) records & generating templates
		consumed.each(function (i) {
			if (self.filter === null || !(self.filter instanceof Object)) items.push({key: i.key, template: fn(i)});
			else {
				$.iterate(self.filter, function (v, k) {
					if (registry.index(i.key) > -1) return;

					var x     = 0,
					    regex = new RegExp(),
					    nth;

					v   = v.explode();
					nth = v.length;

					for (x = 0; x < nth; x++) {
						regex.compile(v[x], "i");
						if ((k === self.store.key && regex.test(i.key)) || (typeof i.data[k] !== "undefined" && regex.test(i.data[k]))) {
							registry.push(i.key);
							items.push({key: i.key, template: fn(i)});
							return;
						}
					}
				});
			}
		});

		// Preparing the target element
		element.clear().on("afterTemplate", function (obj) { if (callback) self.callback(obj); }, "callback");
		items.each(function (i) {
			if (attr) {
				var guid = $.genId();

				$.on("afterCreate", function (obj) {
					$.un("afterCreate", guid);
					obj.data("key", i.key);
				}, guid);
			}
			element.tpl(i.template);
		});
		element.un("afterTemplate", "callback");
		this.store.parentNode.fire("afterDataListRefresh", this.element);
		return this;
	};

	/**
	 * Sorts data list & refreshes element
	 * 
	 * Events: beforeDataListRefresh, afterDataListRefresh
	 * 
	 * @param  {String} order       SQL "order by" statement
	 * @param  {String} sensitivity [Optional] Defaults to "ci" ("ci" = insensitive, "cs" = sensitive, "ms" = mixed sensitive)
	 * @return {Object}       DataList instance
	 */
	datalist.prototype.sort = function (order, sensitivity) {
		var $ = global[abaaso.aliased];

		if (typeof order !== "string") throw Error($.label.error.invalidArguments);

		this.store.parentNode.fire("beforeDataListSort");
		this.order       = order;
		this.sensitivity = sensitivity || "ci";
		this.refresh();
		this.store.parentNode.fire("afterDataListSort");
		return this;
	};

	/**
	 * Initialization
	 * 
	 * @param  {Object} abaaso abaaso singleton
	 * @return {Function}      datalist module
	 */
	fn = function (abaaso) {
		abaaso.module("datalist", datalist);
		return abaaso.datalist;
	};

	typeof define === "function" ? define(["abaaso"], function (abaaso) { return fn(abaaso); }) : abaaso.on("init", function () { fn(abaaso); }, "abaaso.datalist");
})(this);
