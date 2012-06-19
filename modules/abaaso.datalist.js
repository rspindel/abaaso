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
 * @requires abaaso 2.2.7
 * @version 1.0.7
 */
(function(a){"use strict";var b,c;b=function(b,c,d,e){var f=a[abaaso.aliased],g=this,h;if(b instanceof Element&&typeof c=="object"&&!!/string|object/.test(typeof d))return h=b.create("ul",{"class":"list"}),this.element=h,this.end=null,this.callback=null,this.filter=null,this.placeholder="",this.order="",this.ready=!1,this.template=d,this.sensitivity="ci",this.start=null,this.store=c,this.store.parentNode.on("afterDataSync",function(){this.refresh()},"refresh-"+h.id,this),this.store.parentNode.on("afterDataDelete",function(a){f("#"+h.id+" li[data-key='"+a.key+"']").destroy()},"delete-"+h.id,this),e instanceof Object&&f.iterate(e,function(a,b){g[b]=a}),this.refresh(),this;throw Error(f.label.error.invalidArguments)},b.prototype.refresh=function(){var b=a[abaaso.aliased],c=this.element,d=typeof this.template=="object",e=!d&&String(this.template).replace(/{{|}}/g,"")===this.store.key,f=[],g=[],h=this,i=b.encode(this.template).indexOf("data-key")<0,j=typeof this.callback=="function",k=/{{.*}}/g,l=new RegExp,m=[],n;return this.ready||(this.ready=!0,this.store.parentNode.on("afterDataSet",function(a){this.refresh()},"set-"+c.id,this)),this.store.parentNode.fire("beforeDataListRefresh"),d?n=function(a){var c=b.encode(h.template);return c=c.replace("{{"+h.store.key+"}}",a.key),b.iterate(a.data,function(a,d){l.compile("{{"+d+"}}","g"),c=c.replace(l,b.encode(a).replace(/(^")|("$)/g,""))}),c=b.decode(c.replace(k,h.placeholder)),{li:c}}:n=function(a){var c=String(h.template);return c=c.replace("{{"+h.store.key+"}}",a.key),b.iterate(a.data,function(a,b){l.compile("{{"+b+"}}","g"),c=c.replace(l,a)}),{li:c.replace(k,h.placeholder)}},f=this.order.isEmpty()?this.store.get():this.store.sort(this.order,!1,this.sensitivity),typeof this.start=="number"&&typeof this.end=="number"&&(f=f.range(this.start,this.end)),f.each(function(a){h.filter!==null&&h.filter instanceof Object?b.iterate(h.filter,function(b,c){if(m.index(a.key)>-1)return;var d=0,e=new RegExp,f;b=b.explode(),f=b.length;for(d=0;d<f;d++){e.compile(b[d],"i");if(c===h.store.key&&e.test(a.key)||typeof a.data[c]!="undefined"&&e.test(a.data[c])){m.push(a.key),g.push({key:a.key,template:n(a)});return}}}):g.push({key:a.key,template:n(a)})}),c.clear(),g.each(function(a){var b;b=c.tpl(a.template),i&&b.data("key",a.key),j&&h.callback(b)}),this.store.parentNode.fire("afterDataListRefresh",c),this},b.prototype.sort=function(b,c){var d=a[abaaso.aliased];if(typeof b!="string")throw Error(d.label.error.invalidArguments);return this.store.parentNode.fire("beforeDataListSort"),this.order=b,this.sensitivity=c||"ci",this.refresh(),this.store.parentNode.fire("afterDataListSort"),this},c=function(a){return a.module("datalist",b),a.datalist},typeof define=="function"?define(["abaaso"],function(a){return c(a)}):abaaso.on("init",function(){c(abaaso)},"abaaso.datalist")})(this)