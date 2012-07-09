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
 * @requires abaaso 2.4.7
 * @version 1.1.0
 */
(function(e){"use strict";var t,n;t=function(t,n,r,i){var s=e[abaaso.aliased],o=this,u;if(t instanceof Element&&typeof n=="object"&&!!/string|object/.test(typeof r))return u=t.create("ul",{"class":"list",id:n.parentNode.id+"-datalist"}),this.element=u,this.end=null,this.callback=null,this.filter=null,this.placeholder="",this.order="",this.ready=!1,this.refreshing=!1,this.template=r,this.sensitivity="ci",this.start=null,this.store=n,i instanceof Object&&s.iterate(i,function(e,t){o[t]=e}),this.store.parentNode.on("afterDataDelete",function(e){var t;typeof this.start=="number"&&typeof this.end=="number"?this.refresh():this.element.find("li[data-key='"+e.key+"']").destroy()},"delete-"+u.id,this),this.store.parentNode.on("afterDataSync",function(){this.refreshing||this.refresh()},"refresh-"+u.id,this),this.store.total>0&&this.refresh(),this;throw Error(s.label.error.invalidArguments)},t.prototype.refresh=function(){var t=e[abaaso.aliased],n=this.element,r=typeof this.template=="object",i=!r&&String(this.template).replace(/{{|}}/g,"")===this.store.key,s=[],o=[],u=this,a=typeof this.callback=="function",f=/{{.*}}/g,l=new RegExp,c=[],h;return this.ready||(this.ready=!0,this.store.parentNode.on("afterDataSet",function(e){this.refreshing||this.refresh()},"set-"+n.id,this)),this.store.parentNode.fire("beforeDataListRefresh"),this.refreshing=!0,r?h=function(e){var n=t.encode(u.template);return n=n.replace("{{"+u.store.key+"}}",e.key),t.iterate(e.data,function(e,r){l.compile("{{"+r+"}}","g"),n=n.replace(l,t.encode(e).replace(/(^")|("$)/g,""))}),n=t.decode(n.replace(f,u.placeholder)),{li:n}}:h=function(e){var n=String(u.template);return n=n.replace("{{"+u.store.key+"}}",e.key),t.iterate(e.data,function(e,t){l.compile("{{"+t+"}}","g"),n=n.replace(l,e)}),{li:n.replace(f,u.placeholder)}},s=this.order.isEmpty()?this.store.get():this.store.sort(this.order,!1,this.sensitivity),typeof this.start=="number"&&typeof this.end=="number"&&(s=s.range(this.start,this.end)),s.each(function(e){u.filter!==null&&u.filter instanceof Object?t.iterate(u.filter,function(t,n){if(c.index(e.key)>-1)return;var r=0,i=new RegExp,s;t=t.explode(),s=t.length;for(r=0;r<s;r++){i.compile(t[r],"i");if(n===u.store.key&&i.test(e.key)||typeof e.data[n]!="undefined"&&i.test(e.data[n])){c.push(e.key),o.push({key:e.key,template:h(e)});return}}}):o.push({key:e.key,template:h(e)})}),n.clear(),o.each(function(e){var t;t=n.tpl(e.template),t.data("key",e.key),a&&u.callback(t)}),this.refreshing=!1,this.store.parentNode.fire("afterDataListRefresh",n),this},t.prototype.sort=function(t,n){var r=e[abaaso.aliased];if(typeof t!="string")throw Error(r.label.error.invalidArguments);return this.store.parentNode.fire("beforeDataListSort"),this.order=t,this.sensitivity=n||"ci",this.refresh(),this.store.parentNode.fire("afterDataListSort"),this},n=function(e){return e.module("datalist",t),e.datalist},typeof define=="function"?define(["abaaso"],function(e){return n(e)}):abaaso.on("init",function(){n(abaaso)},"abaaso.datalist")})(this)