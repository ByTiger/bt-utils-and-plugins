/*******************************************************************
 * @copyright © Aliaksei Puzenka, 2013-2017
 * @copyright © bytiger.com, 2013-2017
 * @version 1.0.5
 * @description
 * BTUtils is ES5 JavaScript library to make easier your development work.
 * @license
 * This software is allowed to use under "GPL v3" (http://www.gnu.org/licenses/old-licenses/gpl-3.0.html)
 * or you need to obtain commercial license to use it in non-"GPL v3" project.
 * For more info please contact support@bytiger.com for details.
 * @dependencies
 * - jQuery
 *******************************************************************/

(function(window) {
    "use strict";

    window.BTUtils = {
        _idCounter: 0,

        /**
         * dispatch event to window object
         * @param {string} eventName
         */
        triggerEventOnWindow: function(eventName) {
            var evt = document.createEvent("Event");
            evt.initEvent(eventName, true, false);
            window.dispatchEvent(evt);
        },

        /**
         * load new CSS file trought attach <link>
         * @param {string} url
         */
        loadCss: function(url) {
            var link = document.createElement("link");
            link.type = "text/css";
            link.rel = "stylesheet";
            link.href = url;
            document.getElementsByTagName("head")[0].appendChild(link);
        },

        /**
         * generate new ID like timestamp + _ + counter
         * @returns {string}
         */
        generateId: function() {
            return (new Date()).getTime().toString() + "_" + (++BTUtils._idCounter).toString();
        },

        /**
         * define getter and setter to Object
         * @param {Object} obj
         * @param {string} field
         * @param {Function} getter
         * @param {Function} setter
         */
        defineGetSet: function(obj, field, getter, setter) {
            if(/msie/.test(navigator.userAgent.toLowerCase())) {
                Object.defineProperty(obj, field, {
                    get: getter,
                    set: setter
                });
            } else {
                obj.__defineSetter__(field, setter);
                obj.__defineGetter__(field, getter);
            }
        },

        /**
         * return sum of children heights
         * @param {jQuery} obj
         * @returns {number}
         */
        getSumOfChildrenHeights: function(obj) {
            var items = obj.children();
            var qq, hh = 0;
            for(qq = 0; qq < items.length; ++qq) {
                if(!items.eq(qq).is(":visible")) {
                    continue;
                }
                var tmp = items.get(qq).getBoundingClientRect();
                hh += tmp.height || items.eq(qq).height();
            }
            return hh;
        },

        /**
         * convert array with byte numbers to hex string
         * @param {Array} arr
         * @returns {string}
         */
        arrayToHexString: function(arr) {
            if(!arr || !arr.length) {
                return "";
            }

            var qq, tmp, nn, str = "";
            for(qq = 0; qq < arr.length; ++qq) {
                nn = arr[qq] > 0 ? arr[qq] : 256 + arr[qq];
                tmp = nn.toString(16);
                str += (tmp.length < 2 ? "0" : "") + tmp;
            }
            return str;
        },

        /**
         * calculate top offset
         * the "getBoundingClientRect" work poor in phonegap, so this function is in use
         * @param {Node} obj
         * @returns {object} -- {left, top} offset
         */
        calcOffset: function(obj) {
            var res = {left: 0, top: 0};
            for(; ;) {
                res.left += obj.offsetLeft;
                res.top += obj.offsetTop;
                obj = obj.parentNode;
                if(obj === document || obj === window || obj === null) {
                    break;
                }
            }
            return res;
        },

        /**
         * scroll page to element
         * @param {jQuery|Node} element
         */
        scrollToCenterVertically: function(element) {
            var obj = element.jquery ? element[0] : element;
            var parentScroll = obj.parentNode;
            while(parentScroll) {
                if(parentScroll.scrollHeight > parentScroll.clientHeight) {
                    var styles = window.getComputedStyle(parentScroll, "");
                    if(styles.overflowY === "auto" || styles.overflowY === "scroll" || parentScroll.tagName === "BODY") {
                        break;
                    }
                }
                parentScroll = parentScroll.parentNode;
                if(parentScroll === window.document || parentScroll === window) {
                    parentScroll = null;
                }
            }
            if(!parentScroll) {
                return;
            }

            var hh = parentScroll.clientHeight;
            var bound = obj.getBoundingClientRect();
            var topPos = BTUtils.calcOffset(obj);
            var off_y = (hh > bound.height ? hh - bound.height : 0) / 2;
            parentScroll.scrollTop = Math.round(topPos - off_y);
        },

        scrollToTopOfPage: function() {
            if(window.document && window.document.body && window.document.body.scrollTop) {
                window.document.body.scrollTop = 0;
            }
        },

        /**
         * convert string with class names to selector
         * @param {string} str
         * @returns {string}
         */
        classToSelector: function(str) {
            return "." + str.trim().replace(/\s/g, ".");
        },

        /**
         * check is element or his parent is corresponds to the selector
         * @param {HTMLElement} obj -- checked element
         * @param {string} selector -- selector
         * @param {HTMLElement} parent -- parent element for selector
         * @returns {boolean}
         */
        checkSelector: function(obj, selector, parent) {
            if(!parent) {
                parent = document;
            } else {
                parent = parent.jquery ? parent[0] : parent;
            }
            obj = obj.jquery ? obj[0] : obj;

            var qq, list = parent.querySelectorAll(selector);
            for(qq = 0; qq < list.length; ++qq) {
                if(list[qq] === obj || list[qq].contains(obj)) {
                    return list[qq];
                }
            }
            return null;
        },

        /**
         * format number
         * @param {string|Number} num
         * @param {int} digitAfterPoint
         * @returns {string}
         */
        formatFloat: function(num, digitAfterPoint) {
            if(typeof(num) === "undefined" || num === null || num === "") {
                return "";
            }

            if(typeof(num) === "string") {
                num = parseFloat(num.replace(/,/, "."));
            }

            var str = num.toFixed(digitAfterPoint);
            if(str.indexOf(",") >= 0 || str.indexOf(".") >= 0) {
                str = str.replace(/0+$/, "").replace(/[.,]?$/, "");
            }
            return str;
        },

        /**
         * @param {element} obj
         * @param {event} event
         * @returns {{x: (mouse.getMousePos.pageX|*|pageX), y: (mouse.getMousePos.pageY|*|pageY)}}
         */
        getEventPosBy: function(obj, event) {
            var off = obj ? jQuery(obj).offset() : {left: 0, top: 0};
            var res = {
                x: event.pageX ? event.pageX : (event.originalEvent && event.originalEvent.touches && event.originalEvent.touches[0] ? event.originalEvent.touches[0].pageX : 0),
                y: event.pageY ? event.pageY : (event.originalEvent && event.originalEvent.touches && event.originalEvent.touches[0] ? event.originalEvent.touches[0].pageY : 0)
            };
            res.clientX = res.x - off.left;
            res.clientY = res.x - off.top;
            return res;
        },

        /**
         * @param {Event} event
         * @param {int} num
         * @returns {int}
         */
        getMouseEventX: function(event, num) {
            if(event.originalEvent.touches || event.originalEvent.changedTouches) {
                var touch = event.originalEvent.touches ? event.originalEvent.touches : event.originalEvent.changedTouches;
                if(typeof(num) == "undefined") num = 0;
                if(num >= touch.length) return 0;
                return touch[num].pageX - parseInt(jQuery(event.currentTarget).offset().left);
            }
            return event.offsetX ? event.offsetX : (event.layerX ? event.layerX : (event.originalEvent.offsetX ? event.originalEvent.offsetX : (event.originalEvent.layerX ? event.originalEvent.layerX : (0))));
        },

        /**
         * @param {Event} event
         * @param {int} num
         * @returns {int}
         */
        getMouseEventY: function(event, num) {
            if(event.originalEvent.touches || event.originalEvent.changedTouches) {
                var touch = event.originalEvent.touches ? event.originalEvent.touches : event.originalEvent.changedTouches;
                if(typeof(num) == "undefined") num = 0;
                if(num >= touch.length) return 0;
                return touch[num].pageY - parseInt(jQuery(event.currentTarget).offset().top);
            }
            return event.offsetY ? event.offsetY : (event.layerY ? event.layerY : (event.originalEvent.offsetY ? eventoriginalEvent.offsetY : (event.originalEvent.layerY ? event.originalEvent.layerY : (0))));
        },

        /**
         * check is value defined and not null
         * @param {*} v
         * @returns {boolean}
         */
        isDef: function(v) {
            return (typeof(v) !== "undefined" && v !== null);
        },

        /**
         * @param {string} classList
         * @returns {Function}
         */
        addClassByEvent: function(classList) {
            return function(event) {
                jQuery(event.target).addClass(classList);
            };
        },

        /**
         * @param {event} event
         */
        preventEvent: function(event) {
            if(event && event.preventDefault) {
                event.preventDefault();
            }
        },

        /**
         * @param {event} event
         */
        stopEvent: function(event) {
            if(event && event.stopPropagation) {
                event.stopPropagation();
            }
        },

        /**
         * @param {Event} event
         */
        breakEvent: function(event) {
            if(event && event.preventDefault) {
                event.preventDefault();
            }
            if(event && event.stopPropagation) {
                event.stopPropagation();
            }
            return false;
        },

        /**
         * call Function for each own property on Object/Array/jQuery
         * @param {Array|Object|jQuery} arr
         * @param {Function} func
         * @returns {boolean}
         */
        each: function(arr, func) {
            if(typeof(arr) !== 'object' || arr === null || !func) {
                return true;
            }

            var qq, prm;
            if(arr instanceof jQuery) {
                for(qq = 0; qq < arr.length; ++qq) {
                    if(func(arr.eq(qq), qq, arr) === false) {
                        return false;
                    }
                }
            } else if(arr instanceof Array) {
                for(qq = 0; qq < arr.length; ++qq) {
                    if(func(arr[qq], qq, arr) === false) {
                        return false;
                    }
                }
            } else {
                prm = Object.keys(arr);
                for(qq = 0; qq < prm.length; ++qq) {
                    if(func(arr[prm[qq]], prm[qq], arr) === false) {
                        return false;
                    }
                }
            }
            return true;
        },

        /**
         * is array empty || is object empty || !obj
         * @param {object|Array} obj
         * @returns {boolean}
         */
        isEmpty: function(obj) {
            if(obj instanceof Array) {
                return !(obj.length > 0);
            }
            if(typeof(obj) === "object" && obj) {
                return (Object.keys(obj).length <= 0);
            }
            return !(obj);
        },

        /**
         * @param {Array|Object} arr
         * @returns {int}
         */
        count: function(arr) {
            if(typeof(arr) !== 'object') {
                return 0;
            }

            if(arr instanceof Array) {
                return arr.length;
            }
            return Object.keys(arr).length;
        },

        /**
         * call Function for each own property on object/array/jQuery,
         * add property to result if function return true
         * @param {Array|Object|jQuery} arr
         * @param func
         * @returns {jQuery|object|Array|null}
         */
        filter: function(arr, func) {
            if(typeof(arr) !== 'object' || !func) {
                return true;
            }

            var qq;
            var res = null;
            if(arr instanceof jQuery) {
                res = jQuery();
                for(qq = 0; qq < arr.length; ++qq) {
                    if(func(arr.eq(qq), qq, arr) === true) {
                        res.add(arr.eq(qq));
                    }
                }
            } else if(arr instanceof Array) {
                res = [];
                for(qq = 0; qq < arr.length; ++qq) {
                    if(func(arr[qq], qq, arr) === true) {
                        res.push(arr[qq]);
                    }
                }
            } else {
                res = {};
                for(qq in arr) {
                    if(arr.hasOwnProperty(qq)) {
                        if(func(arr[qq], qq, arr) === false) {
                            res[qq] = arr[qq];
                        }
                    }
                }
            }
            return res;
        },

        /**
         * remove duplicate values from array (not changing orders)
         * @param {Array} arr
         * @return {Array}
         */
        uniqueArray: function(arr) {
            return arr.filter(function (v,n) { return arr.indexOf(v) >= n; });
        },

        /**
         * get any alement from array or object
         * @param {Array|Object} obj
         * @returns {*|null}
         */
        getAnyValue: function(obj) {
            if(obj instanceof Array) {
                return obj.length > 0 ? obj[0] : null;
            } else if(obj instanceof Object) {
                for(var qq in obj) {
                    if(obj.hasOwnProperty(qq)) {
                        return obj[qq];
                    }
                }
            }
            return null;
        },

        /**
         * generate new array with result from callback function,
         * note: skip undefined and null values
         * @param {Array|Object} array
         * @param {Function} func
         * @returns {Array}
         */
        recastArray: function(array, func) {
            var qq, tmp, res;
            if(array instanceof Array) {
                res = [];
                for(qq = 0; qq < array.length; ++qq) {
                    tmp = func(array[qq], qq, array);
                    if(typeof(tmp) !== "undefined" && tmp !== null && (typeof(tmp) !== "number" || !isNaN(tmp))) {
                        res.push(tmp);
                    }
                }
            } else if(array instanceof Object) {
                res = {};
                var keys = Object.keys(array);
                for(qq = 0; qq < keys.length; ++qq) {
                    tmp = func(array[keys[qq]], keys[qq], array);
                    if(typeof(tmp) !== "undefined" && tmp !== null && (typeof(tmp) !== "number" || !isNaN(tmp))) {
                        res[keys[qq]] = tmp;
                    }
                }
            }
            return res;
        },

        /**
         * return new array with values that contains all two arrays
         * @param {Array} a
         * @param {Array} b
         * @returns {Array}
         */
        intersectArrays: function(a, b) {
            var arr1 = a.length < b.length ? a : b;
            var arr2 = a.length < b.length ? b : a;
            return arr1.filter(function(n) {
                return arr2.indexOf(n) != -1;
            });
        },

        /**
         * compare arrays values. not depends in values position (not changing orders)
         * note: duplicates not counts twice
         * @param {Array} a
         * @param {Array} b
         * @returns {boolean} -- return true if arrays equal
         */
        compareArrayValues: function(a, b) {
            if(a.length !== b.length) return false;
            return !a.some(function(n) {
                return b.indexOf(n) == -1;
            });
        },

        /**
         * remove duplicate values from array (not changing orders)
         * @param {Array} a
         * @returns {Array}
         */
        removeDuplicatesInArray: function(a) {
            var tmp = {};
            return a.filter(function(v) {
                if(typeof(tmp[v]) === "undefined") {
                    tmp[v] = true;
                    return true;
                } else {
                    return false;
                }
            });
        },

        /**
         * concat several arrays to one (null values and not arrays are skipped)
         * @returns {Array}
         */
        concatArrays: function () {
            var qq, res = [];
            for(qq = 0; qq < arguments.length; ++qq) {
                if(arguments[qq] instanceof Array) {
                    res = res.concat(arguments[qq]);
                }
            }
            return res;
        },

        /**
         * convert array to object using defined field as key
         * @param {Array} arr
         * @param {string} idField
         * @returns {Object}
         */
        arrayToObject: function(arr, idField) {
            var qq, res = {};
            for(qq = 0; qq < arr.length; ++qq) {
                res[arr[qq][idField]] = arr[qq];
            }
            return res;
        },

        /**
         * convert object to array
         * and set key to defined field in each object
         * @param {Object} obj
         * @param {string} idField
         * @returns {Array}
         */
        objectToArray: function(obj, idField) {
            var qq, res = [];
            var keys = Object.keys(obj);
            for(qq = 0; qq < keys.length; ++qq) {
                if(idField) {
                    obj[keys[qq]][idField] = keys[qq];
                }
                res.push(obj[keys[qq]]);
            }
            return res;
        },

        /**
         * remove all fields from object or array
         * @param {Object|Array} obj
         */
        clearObject: function(obj) {
            if(obj instanceof Array) {
                obj.length = 0;
            } else if(obj instanceof Object) {
                var qq, keys = Object.keys(obj);
                for(qq = 0; qq < keys.length; ++qq) {
                    delete obj[keys[qq]];
                }
            }
        },

        /**
         * split string with int values to array
         * @param {string} str
         * @param {string} [delimiter]
         * @returns {Array}
         */
        splitToIntArray: function(str, delimiter) {
            if(!str) {
                return [];
            }
            var qq, ss = typeof(str) === "string" ? str.split(delimiter || ",") : [str];
            for(qq = 0; qq < ss.length; ++qq) {
                ss[qq] = parseInt(ss[qq], 10);
            }
            return ss;
        },

        _singleTimeoutIds: {},

        /**
         * allow to create setTimeout associated with id
         * if time-out with the same id already present -- rewrite it and restart timer
         * @param {string} id -- timer ID
         * @param {Function} func -- timeout function
         * @param {int} [timeOut] -- 1 by default
         * @param {boolean} [notUpdate] -- keep to use old function
         * @returns {*}
         */
        setSingleTimeout: function(id, func, timeOut, notUpdate) {
            if(!BTUtils._singleTimeoutIds) {
                BTUtils._singleTimeoutIds = {};
            }
            if(BTUtils._singleTimeoutIds[id]) {
                if(notUpdate) return;
                clearTimeout(BTUtils._singleTimeoutIds[id]);
                delete (BTUtils._singleTimeoutIds[id]);
            }
            BTUtils._singleTimeoutIds[id] = setTimeout(function() {
                delete (BTUtils._singleTimeoutIds[id]);
                if(func) {
                    func.call(BTUtils);
                }
            }, timeOut ? timeOut : 1);
            return BTUtils._singleTimeoutIds[id];
        },

        /**
         * disable and remove single time-out
         * @param {string} id
         */
        clearSingleTimeout: function(id) {
            if(!BTUtils._singleTimeoutIds) {
                return;
            }
            if(BTUtils._singleTimeoutIds[id]) {
                clearTimeout(BTUtils._singleTimeoutIds[id]);
                delete (BTUtils._singleTimeoutIds[id]);
            }
        },

        /**
         * setTimeout synced with requestAnimationFrame
         * @param {Function} func
         * @param {int} timeOut
         */
        setAnimTimeout: function(func, timeOut) {
            if(!window.requestAnimFrame) {
                window.requestAnimFrame = (function () {
                    return window.requestAnimationFrame ||
                        window.webkitRequestAnimationFrame ||
                        window.mozRequestAnimationFrame ||
                        window.oRequestAnimationFrame ||
                        window.msRequestAnimationFrame ||
                        function (callback, element) {
                            window.setTimeout(callback, 1000 / 60);
                        };
                })();
            }

            if(!timeOut) {
                window.requestAnimFrame(func);
            } else {
                setTimeout(function() { window.requestAnimFrame(func); }, timeOut);
            }
        },

        /**
         * @param {Function} func
         * @param {Object|null} [base]
         * @param {*} [params...]
         */
        delayRun: function(func, base, params) {
            var args = Array.prototype.splice.call(arguments, 2);
            setTimeout(function(){
                if(base) {
                    func.apply(base, args);
                } else {
                    func(args);
                }
            }, 1);
        },

        /**
         * make ajax request
         * @param data {object}
         *  - obj {Node|jQuery|string} -- node or selector for showing loading overlay
         *  - url {string} -- request url
         *  - post {string|object} - optional, get request will do by default
         *  - crossDomain {bool} -- optional, false by default
         *  - type {string} -- optional, json by default
         *  - ok {function} -- optional, successful callback
         *  - error {function} -- optional, error callback
         *  - callback {function } -- optional, common callback function with first bool value as status
         * @returns {*}
         */
        ajax: function(data) {
            if(!data.url) {
                return;
            }

            var tmp = {
                url: data.url,// || avista.params.urls.login,
                method: typeof(data.post) !== "undefined" ? "post" : "get",
                crossDomain: !!data.crossDomain,
                cache: false
            };

            if(typeof(data.post) !== "undefined") {
                if(typeof(data.post) === "string") {
                    tmp.data = data.post;
                } else {
                    tmp.data = "";
                    var qq;
                    for(qq in data.post) {
                        if(data.post.hasOwnProperty(qq) && data.post[qq] !== null) {
                            tmp.data += (tmp.data.length > 0 ? "&" : "") + qq + "=" + encodeURIComponent(data.post[qq]);
                        }
                    }
                }
            }

            var overlayObj = data.obj ? jQuery(data.obj) : null;

            tmp.success = function(response/*, textStatus, jqXHR*/) {
                if(overlayObj) {
                    BTUtils.hideLoadOverlay(overlayObj);
                }

                if(typeof(data.type) === "undefined" || data.type === "json") {
                    if(typeof(response) === "string") {
                        try {
                            response = JSON.parse(response);
                        } catch(e) {
                            response = null;
                        }
                    }
                }
                if(data.ok) {
                    data.ok(response);
                }
                if(data.success) {
                    data.success(response);
                }
                if(data.callback) {
                    data.callback(true, response);
                }
            };
            tmp.error = function(obj, errText, err) {
                if(overlayObj) {
                    BTUtils.hideLoadOverlay(overlayObj);
                }

                if(obj.status === 200) {
                    if(data.ok) {
                        data.ok(null);
                    }
                    if(data.success) {
                        data.success(null);
                    }
                    if(data.callback) {
                        data.callback(true, null);
                    }
                } else {
                    if(data.error) {
                        data.error(obj.responseJSON ? obj.responseJSON : null);
                    }
                    if(data.callback) {
                        data.callback(false, obj.responseJSON ? obj.responseJSON : null);
                    }
                }
            };

            if(overlayObj) {
                BTUtils.showLoadOverlay(overlayObj);
            }
            return jQuery.ajax(tmp);
        },

        /**
         * @param {object} data
         */
        uploadFile: function(data) {
            var uploader = new FileUploader({maxUploadFileSize: (data.maxFileSize || 8 * 1024 * 1024)});
            uploader.setUrl(data.url);
            uploader.setData(data.post);
            uploader.onFileToLarge = function() {
                if(data.callback) {
                    data.callback(false);
                }
            };
            uploader.onFinish = function(id, name, info) {
                if(data.callback) {
                    data.callback(true, info, id, name);
                }
            };
            uploader.uploadFile(data.file);
        },

        loadOverlayText: "",

        /**
         * @param {jQuery} [obj]
         */
        showLoadOverlay: function(obj) {
            obj = obj ? obj : (document.documentElement || document.body);
            jQuery("<div>", {"class": "generic-loading-overlay"}).html("<div>" + this.loadOverlayText + "</div>").appendTo(obj);
        },

        /**
         * @param {jQuery} [obj]
         */
        hideLoadOverlay: function(obj) {
            if(!obj) {
                jQuery(".generic-loading-overlay").remove();
            } else {
                obj.find(".generic-loading-overlay").remove();
            }
        },

        /**
         * @param {string} id
         * @param {Object} [fields] -- key-value pairs, where key -- is selector
         * @returns {jQuery|null}
         */
        getTemplate: function(id, fields) {
            var obj = document.getElementById(id);
            if(!obj) {
                return null;
            }

            var tmp = jQuery("<div>").html(obj.innerText);
            if(fields) {
                for(var qq in fields) {
                    if(fields.hasOwnProperty(qq)) {
                        var val = fields[qq];
                        if(typeof(val) === "string" || typeof(val) === "number") {
                            if(tmp.filter(qq).length > 0) {
                                tmp.filter(qq).html(val);
                            } else if(tmp.find(qq).length > 0) {
                                tmp.find(qq).html(val);
                            }
                        } else {
                            if(typeof(val.text) !== "undefined") {
                                if(tmp.filter(qq).length > 0) {
                                    tmp.filter(qq).text(val.text);
                                } else if(tmp.find(qq).length > 0) {
                                    tmp.find(qq).text(val.text);
                                }
                            } else if(typeof(val.src) !== "undefined") {
                                if(tmp.filter(qq).length > 0) {
                                    tmp.filter(qq).attr("src", val.src);
                                } else if(tmp.find(qq).length > 0) {
                                    tmp.find(qq).attr("src", val.src);
                                }
                            }
                        }
                    }
                }
            }
            return tmp.children();
        },

        /**
         * generate GUID as "XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX"
         * @returns {string}
         */
        generateGUID: function() {
            function s4() {
                return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
            }

            var str = (Date.now()).toString(16) + s4() + s4() + s4() + s4() + s4() + s4() + s4() + s4();
            return str.substr(0, 8) + '-' + str.substr(8, 4) + '-' + str.substr(12, 4) + '-' + str.substr(16, 4) + '-' + str.substr(20, 12);
        },

        /**
         * @param {string} str
         * @returns {*}
         */
        JSON_parse: function(str) {
            if(typeof(str) == "string") return JSON.parse(str);
            return str;
        },

        /**
         * @param {*} json
         * @returns string
         */
        JSON_stringify: function(json) {
            if(typeof(str) == "string") return str;
            return JSON.stringify(json);
        },

        normalizeNumber: function(n) {
            return +(n).toFixed(9);
        },

        /**
         * return name of active input element or NULL
         * @returns string|null
         */
        isInputActive: function() {
            var selEl = document.activeElement;
            if(jQuery(selEl).closest("div[contenteditable=true]").length > 0) {
                return "contenteditable";
            }
            if(selEl.nodeType === 1 && selEl.nodeName.toUpperCase() === "TEXTAREA") {
                return "textarea";
            }
            if(selEl.nodeType === 1 && selEl.nodeName.toUpperCase() === "INPUT") {
                return "input";
            }
            return null;
        },

        /**
         * @param {string} str
         * @returns string
         */
        text2html: function(str) {
            str = str.replace(/&/g, '&amp;');
            str = str.replace(/</g, "&lt;");
            str = str.replace(/>/g, "&gt;");
            str = str.replace(/"/g, '&quot;');
            str = str.replace(/'/g, '&#039;');
            str = str.replace(/\n/g, "<br>");
            return str;
        },

        /**
         * retrieve android version in different types
         * @param {string} [ua] -- user-agent string
         * @returns {{ver:int, float:float, n1:int, n2:int, n3:int}}
         */
        getAndroidVersion: function(ua) {
            ua = (ua || navigator.userAgent).toLowerCase();
            var match = ua.match(/android\s([0-9\.]*)/);
            if(!match || !match[1]) {
                return null;
            }
            var arr = match[1].split(".");
            return {
                "n1": parseInt(arr[0], 10),
                "n2": arr[1] ? parseInt(arr[1], 10) : 0,
                "n3": arr[2] ? parseInt(arr[2], 10) : 0,
                "ver": parseInt(match[1], 10),
                "float": parseFloat(match[1])
            }
        },

        /**
         * return true is current device is iOS device
         * NOTE: for phonegap use
         * @returns {boolean}
         */
        isIOS: function() {
            return (window.device && window.device.platform && window.device.platform.toLowerCase() == "ios");
        },

        /**
         * return true is running in Firefox in browser
         * @returns {boolean}
         */
        isFirefoxBrowser: function() {
            return (window.location.hostname.length > 0 && window.navigator.userAgent.indexOf("Firefox") >= 0);
        },

        /**
         * copy Array or Object field to another Array or Object,
         * return destination object (or new one in case of copy),
         * or return copy for simple value
         * @param {*} obj -- source
         * @param {Array|Object} [toObj] -- destination
         * @param {boolean} [keepExists] -- just update exists fields in result object
         * @returns {*}
         */
        clone: function(obj, toObj, keepExists) {
            if(obj === null) return null;
            if(typeof(obj) === "undefined") return undefined;
            if(obj instanceof Date) return new Date(obj);
            if(obj instanceof Function) return obj;

            var qq, res;
            if(obj instanceof Array) {
                res = toObj ? toObj : [];
                for(qq = 0; qq < obj.length; ++qq) {
                    if(!keepExists || typeof(res[qq]) === "undefined") {
                        res[qq] = this.clone(obj[qq]);
                    }
                }
                return res;
            }
            if(obj instanceof Object) {
                res = toObj ? toObj : {};
                var kk = Object.keys(obj);
                for (qq = 0; qq < kk.length; ++qq) {
                    if(!keepExists || typeof(res[kk[qq]]) === "undefined") {
                        res[kk[qq]] = this.clone(obj[kk[qq]]);
                    }
                }
                return res;
            }
            return undefined;
        },

        /**
         * do post request in new window
         * @param {string} url
         * @param {object} data -- post data in key:value form
         */
        openPostWindow: function(url, data) {
            var mapForm = document.createElement("form");
            mapForm.target = "_blank";
            mapForm.method = "POST";
            mapForm.action = url;

            var qq, kk = Object.keys(data);
            for(qq = 0; qq < kk.length; ++qq) {
                var mapInput = document.createElement("input");
                mapInput.type = "text";
                mapInput.name = kk[qq];
                mapInput.value = data[kk[qq]];
                mapForm.appendChild(mapInput);
            }

            document.body.appendChild(mapForm);
            mapForm.submit();

            setTimeout(function() {
                document.body.removeChild(mapForm);
            }, 100);
        },

        /**
         * @param {string} url
         * @returns {{protocol: string, host: (string|*), hostname: string, port: (string|Function), pathname: string, hash, search: (*|string|bkLib.search), origin}}
         */
        parseUrl(url) {
            var tmp = document.createElement('a');
            tmp.href = "url";
            return {
                protocol: tmp.protocol,
                host: tmp.host,
                hostname: tmp.hostname,
                port: tmp.port,
                pathname: tmp.pathname,
                hash: tmp.hash,
                search: tmp.search,
                origin: tmp.origin
            };
        },

        /**
         * @param {number} lat1
         * @param {number} lng1
         * @param {number} lat2
         * @param {number} lng2
         * @returns {number}
         */
        getDistanceByGSPPosition: function (lat1, lng1, lat2, lng2) {
            var sin = function (a) {
                return Math.sin(a * Math.PI / 180);
            };
            var cos = function (a) {
                return Math.cos(a * Math.PI / 180);
            };
            var dx = lng2 - lng1;
            var dy = lat2 - lat1;
            var a = sin(dy / 2) * sin(dy / 2) + cos(lat1) * cos(lat2) * sin(dx / 2) * sin(dx / 2);
            return 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)) * 6371000;
        }
    };
})(window);
