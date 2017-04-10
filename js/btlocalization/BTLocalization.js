/*******************************************************************
 * @copyright © Aliaksei Puzenka, 2013-2017
 * @copyright © bytiger.com, 2013-2017
 * @version 1.0.1
 * @description
 * BTLocalization is ES6 JavaScript library to implement simple multi language to web-app
 * @license
 * This software is allowed to use under "GPL v3" (http://www.gnu.org/licenses/old-licenses/gpl-3.0.html)
 * or you need to obtain commercial license to use it in non-"GPL v3" project.
 * For more info please contact support@bytiger.com for details.
 * @dependencies
 * - jQuery
 *******************************************************************/
"use strict";

class CBTLocalization {
    constructor() {
        this._texts = {};
    }

    add(data, prefix, update) {
        let key;
        prefix = prefix ? prefix + "|" : "";

        let langs = data ? Object.keys(data) : [];
        langs.forEach((lng) => {
            if(typeof(this._texts[lng]) === "undefined") {
                this._texts[lng] = {};
            }

            let keys = Object.keys(data[lng]);
            keys.forEach((key) => {
                if(
                    !update
                    && typeof(this._texts[lng][prefix + key]) !== "undefined"
                    && this._texts[lng][prefix + key] !== data[lng][key]
                ) {
                    console.warn("BTLocalization: the key '" + key + "' for language '" + lng + "' already present");
                } else {
                    this._texts[lng][prefix + key] = data[lng][key];
                }
            });
        });
        return this;
    };

    /**
     * retrieve text for current (or default) language from _texts storage
     * @param name {string} -- the text and key value
     * @param objOrSelector {string} -- the selector to insert text into object
     * @param prefix {string} -- the prefix, used to split texts by different modules
     * @returns {string}
     */
    t(name, objOrSelector, prefix) {
        if(!name) return "";

        let lang = "en";
        prefix = prefix ? prefix + "|" : "";
        if(typeof Core !== "undefined" && Core.userLang) {
            lang = Core.userLang.toLowerCase();
        } else {
            lang = this.detectLang() || lang;
        }

        let _is = (v) => { return (typeof(v) !== "undefined" && v !== null); };
        let res = "";

        if (this._texts[lang] && _is(this._texts[lang][prefix + name])) {
            res = this._texts[lang][prefix + name];
        } else if (this._texts.en && _is(this._texts.en[prefix + name])) {
            res = this._texts.en[prefix + name];
        } else if (this._texts[lang] && _is(this._texts[lang][name])) {
            res = this._texts[lang][name];
        } else if (this._texts.en && _is(this._texts.en[name])) {
            res = this._texts.en[name];
        } else {
            res = name;
        }

        if(objOrSelector) {
            if(window.jQuery) {
                jQuery(objOrSelector).text(res);
            } else {
                let qq, objs = document.querySelectorAll();
                for(qq = 0; qq < objs.length; ++qq) {
                    objs[qq].innerHTML = res;
                }
            }
        }

        return res;
    };

    detectLang() {
        if(typeof window.navigator.languages !== "undefined") {
            let qq;
            for(qq = 0; qq < window.navigator.languages.length; ++qq) {
                if(this._texts[window.navigator.languages[qq]]) return window.navigator.languages[qq];
            }
        }

        return window.navigator.language ? window.navigator.language : null;
    }

    is(name, prefix) {
        let lang = "en";

        prefix = prefix ? prefix + "|" : "";
        if(typeof Core !== "undefined" && Core.userLang) {
            lang = Core.userLang.toLowerCase();
        }

        return !!((this._texts[lang] && this._texts[lang][prefix + name]) || (this._texts.en && this._texts.en[prefix + name]));
    };

    applyToStatic(obj, prefix) {
        let qq, key, txt, list;

        list = jQuery(obj).find("*[data-btlang]");
        for (qq = 0; qq < list.length; ++qq) {
            key = list.eq(qq).attr("data-btlang");
            if (this.is(key, prefix)) {
                txt = this.t(key, null, prefix);
                if (list.eq(qq)[0].nodeName === "INPUT") {
                    list.eq(qq).val(txt);
                } else {
                    list.eq(qq).html(txt);
                }
            }
        }

        list = jQuery(obj).find("*[data-btlang-title]");
        for (qq = 0; qq < list.length; ++qq) {
            key = list.eq(qq).attr("data-btlang-title");
            if (this.is(key, prefix)) {
                txt = this.t(key, null, prefix);
                list.eq(qq).attr("title", txt);
            }
        }

        list = jQuery(obj).find("*[data-btlang-value]");
        for (qq = 0; qq < list.length; ++qq) {
            key = list.eq(qq).attr("data-btlang-value");
            if (this.is(key, prefix)) {
                txt = this.t(key, null, prefix);
                list.eq(qq).val(txt);
            }
        }

        list = jQuery(obj).find("*[data-btlang-placeholder]");
        for (qq = 0; qq < list.length; ++qq) {
            key = list.eq(qq).attr("data-btlang-placeholder");
            if (this.is(key, prefix)) {
                txt = this.t(key, null, prefix);
                list.eq(qq).attr("placeholder", txt);
            }
        }

        return this;
    };
}

window.BTLocalization = window.BTLocalization || (new CBTLocalization());
window._t = window._t || window.BTLocalization.t.bind(window.BTLocalization);
