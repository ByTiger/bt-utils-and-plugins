/*******************************************************************
 * @copyright © Aliaksei Puzenka, 2013-2017.
 * @copyright © bytiger.com, 2013-2017.
 * @version 1.0.2
 * @description
 * js_global is JavaScript library to make easier your development work.
 * The js_global extends JavaScript's base objects with additional useful functions.
 * @license
 * This software is allowed to use under "GPL v3" (http://www.gnu.org/licenses/old-licenses/gpl-3.0.html)
 * or you need to obtain commercial license to use it in non-"GPL v3" project.
 * For more info please contact support@bytiger.com for details.
 *******************************************************************/

/* global window:true */

(function(window) {
    "use strict";

    if(typeof(Object.keys) === "undefined") {
        /**
         * retrieve all object properties as array
         * @param {object} obj
         * @returns {Array}
         */
        Object.keys = function(obj) {
            let qq, res = [];
            for(qq in obj) {
                if(obj.hasOwnProperty(qq)) {
                    res.push(qq);
                }
            }
            return res;
        };
    }

    /**
     * support only 4 parameters
     * why? because .call() twice as faster then .apply()
     * otherwise you can use just native .bind()
     * @param {*} ptr
     * @returns {Function}
     */
    Function.prototype._bind = function(ptr) {
        let func = this;
        return (function(){ return func.call(ptr, arguments[0], arguments[1], arguments[2], arguments[3], arguments[4]); });
    };

    Function.prototype._bindAndStopEvent = function(ptr) {
        let func = this;
        return (function(){
            arguments[0].stopPropagation();
            arguments[0].preventDefault();
            return func.call(ptr, arguments[0], arguments[1], arguments[2], arguments[3], arguments[4]);
        });
    };

    /**
     * convert date to SQL datetime format in GMT time zone (YYYY-MM-DD HH:II:SS)
     * @returns {string}
     */
    Date.prototype.toSQLGMTTime = function() {
        let f = (n) => {
            return n < 10 ? '0' + n : n;
        };

        let offInMs = this.getTimezoneOffset() * 60 * 1000;
        let nd = new Date(this.getTime() + offInMs);

        return nd.getFullYear() + '-' +
            f(nd.getMonth()+1) + '-' +
            f(nd.getDate()) + ' ' +
            f(nd.getHours()) + ':' +
            f(nd.getMinutes()) + ':' +
            f(nd.getSeconds());
    };

    /**
     * convert date to SQL datetime format in GMT time zone (YYYY-MM-DD)
     * @returns {string}
     */
    Date.prototype.toSQLDate = function() {
        let f = (n) => {
            return n < 10 ? '0' + n : n;
        };

        return this.getFullYear() + '-' + f(this.getMonth() + 1) + '-' + f(this.getDate());
    };

    /**
     * add time zone offset to time
     * note: return new Date object
     * @returns {Date}
     */
    Date.prototype.toLocalTimeZone = function() {
        let offInMs = this.getTimezoneOffset() * 60 * 1000;
        return new Date(this.getTime() - offInMs);
    };

    if(!window.JSON_parse) {
        /**
         * safe JSON parse, return null in case of error
         * @param {*} str
         * @returns {*}
         * @constructor
         */
        window.JSON_parse = function (str) {
            try {
                if(typeof(str) == "string") return JSON.parse(str);
                return str;
            } catch(e) { return null; }
        };
    }

    if(!window.JSON_stringify) {
        /**
         * safe JSON stringify, return null in case of error
         * @param json
         * @returns {*}
         * @constructor
         */
        window.JSON_stringify = function (json) {
            try {
                if (typeof(str) == "string") return str;
                return JSON.stringify(json);
            } catch(e) { return null; }
        };
    }

    if(!window.requestAnimationFrame) {
        window.requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;
    }

    if(!window.console) {
        window.console = {};
    }
    if(!window.console.log) {
        window.console.log = function() {};
    }
    if(!window.console.error) {
        window.console.error = function() {};
    }

    if(!window.console.warn) {
        window.console.warn = function() {};
    }
})(window);
