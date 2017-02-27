/*******************************************************************
 * @copyright Â© Aliaksei Puzenka, 2013-2017.
 * @copyright Â© bytiger.com, 2013-2017.
 * @version 1.0.1
 * @description
 * jquery.ext is JavaScript library to make easier your development work.
 * The jquery.ext extend jQuery object with new functions.
 * @license
 * This software is allowed to use under GPL or you need to obtain commercial license
 * to use it in non-GPL project. Please contact sales@bytiger.com for details
 *******************************************************************/

(function() {
    "use strict";

    if(!jQuery.fn.bt_hide) {
        jQuery.fn.bt_hide = function() {
            this.css("display", "none");
        };
    }

    if(!jQuery.fn.bt_show) {
        jQuery.fn.bt_show = function() {
            this.css("display", "");
        };
    }

    if(!jQuery.fn.attrAsId) {
        jQuery.fn.attrAsId = function(name) {
            var val = this.attr(name);
            return val ? parseInt(val, 10) : 0;
        };
    }

    if(!jQuery.fn.isChecked) {
        jQuery.fn.isChecked = function(isSet) {
            if(typeof(isSet) === "undefined" || isSet === null) {
                return (this && this[0] ? this[0].checked : false);
            }
            if(this && this[0]) {
                this[0].checked = !!isSet;
            }
            return this;
        };
    }

    if(!jQuery.fn.setLeftTop) {
        jQuery.fn.setLeftTop = function (xx, yy) {
            this.css("left", Math.floor(xx) + "px").css("top", Math.floor(yy) + "px");
            return this;
        };
    }

    if(!jQuery.fn.leftPos) {
        jQuery.fn.leftPos = function (xx) {
            if (typeof(xx) == 'undefined') return parseInt(this.css("left"));
            jQuery(this).css("left", Math.floor(xx) + "px");
            return this;
        };
    }

    if(!jQuery.fn.topPos) {
        jQuery.fn.topPos = function (yy) {
            if (typeof(yy) == 'undefined') return parseInt(this.css("top"));
            jQuery(this).css("top", Math.floor(yy) + "px");
            return this;
        };
    }

    if(!jQuery.fn.fullWidth) {
        jQuery.fn.fullWidth = function () {
            return parseFloat(this.css("width"))
                + parseFloat(this.css("padding-left")) + parseInt(this.css("padding-right"))
                + parseFloat(this.css("border-left-width")) + parseInt(this.css("border-right-width"));
        };
    }

    if(!jQuery.fn.fullHeight) {
        jQuery.fn.fullHeight = function () {
            return parseFloat(this.css("height"))
                + parseFloat(this.css("padding-top")) + parseInt(this.css("padding-bottom"))
                + parseFloat(this.css("border-top-width")) + parseInt(this.css("border-bottom-width"));
        };
    }

    if(!jQuery.fn.scrollHeight) {
        jQuery.fn.scrollHeight = function () {
            if (!this || this.length < 1) return 0;
            return this[0].scrollHeight;
        };
    }

    if(!jQuery.fn.clientHeight) {
        jQuery.fn.clientHeight = function () {
            if (!this || this.length < 1) return 0;
            return this[0].clientHeight;
        };
    }

    if(!jQuery.fn.isInFixedPosition) {
        jQuery.fn.isInFixedPosition = function () {
            var tmp = this[0];
            var res = false;
            while (tmp && tmp !== document.body && tmp !== window) {
                var styles = window.getComputedStyle(tmp, "");
                if (styles.position.toLowerCase() === "fixed") {
                    res = true;
                    break;
                }
                tmp = tmp.offsetParent;
            }
            return res;
        };
    }

    if(!jQuery.fn.getBoundingClientRect) {
        jQuery.fn.getBoundingClientRect = function () {
            return this && this[0] ? this[0].getBoundingClientRect() : null;
        };
    }

    if(!jQuery.fn.findParentByClass) {
        jQuery.fn.findParentByClass = function (selector) {
            var classes = selector.split(/\./).filter(function (v) {
                return !!v;
            });
            var tmp = this.parent();
            while (tmp && tmp.length > 0 && tmp[0] !== window && tmp[0] !== document) {
                var isfound = true;
                for (var qq in classes) {
                    isfound = isfound && tmp.hasClass(classes[qq]);
                    if (!isfound) break;
                }
                if (isfound) {
                    return tmp;
                }
                tmp = tmp.parent();
            }
            return jQuery();
        };
    }
    if(!jQuery.fn.freeMove) {
        jQuery.fn.freeMove = function() {
            var _oldX = 0;
            var _oldY = 0;
            var _obj = null;
            var _inProcess = false;

            var _onMouseDown = function(event) {
                event.stopPropagation();
                event.preventDefault();

                if(_inProcess) {
                    return;
                }

                _obj = jQuery(event.currentTarget);
                _oldX = event.pageX;
                _oldY = event.pageY;
                _inProcess = true;
                if(event.type == "mousedown") {
                    jQuery(document.body).on("mousemove", _onMouseMove);
                    jQuery(document.body).on("mouseup", _onMouseUp);
                } else {
                    jQuery(document.body).on("touchmove", _onMouseMove);
                    jQuery(document.body).on("touchend touchcancel", _onMouseUp);
                }
            };

            var _onMouseMove = function(event) {
                event.stopPropagation();
                event.preventDefault();

                if(!_obj) {
                    return;
                }

                var dx = event.pageX - _oldX;
                var dy = event.pageY - _oldY;
                var ll = parseInt(_obj.css("left"), 10);
                var tt = parseInt(_obj.css("top"), 10);
                ll = (isNaN(ll) ? 0 : ll) + dx;
                tt = (isNaN(tt) ? 0 : tt) + dy;
                _obj.css({
                    "left": ll + "px",
                    "top": tt + "px"
                });
                _oldX = event.pageX;
                _oldY = event.pageY;

                var tmp = jQuery(_obj[0].offsetParent);
                var rr = parseInt(tmp.width(), 10) - ll - _obj.width();
                var bb = parseInt(tmp.height(), 10) - tt - _obj.height();
                console.log("left:"+ll+"px;top:"+tt+"px;right:"+rr+"px;bottom:"+bb+"px");
                console.log("left:"+(ll/tmp.width()*100).toFixed(4)+"%;top:"+(tt/tmp.height()*100).toFixed(4)+"%;right:"+(rr/tmp.width()*100).toFixed(4)+"%;bottom:"+(bb/tmp.height()*100).toFixed(4)+"%");
            };

            var _onMouseUp = function(event) {
                event.stopPropagation();
                event.preventDefault();
                _obj = null;
                _inProcess = false;

                jQuery(document.body).off("mousemove touchmove");
                jQuery(document.body).off("mouseup touchend touchcancel");
            };

            this.css("cursor", "pointer");
            this.css("z-index", "1000000");
            this.on("mousedown touchstart", _onMouseDown);
        };
    }

    if(!jQuery.fn.setValue) {
        /**
         * @param val
         * @returns {jQuery}
         */
        jQuery.fn.setValue = function(val) {
            this.each(function() {
                var $this = jQuery(this);
                if(this.nodeName !== "INPUT") {
                    $this.val(typeof(val) === "undefined" || val === null || val === "" ? "" : val)
                    return;
                }

                var type = $this.attr("type");
                if(type === "number") {
                    $this.val(typeof(val) === "undefined" || val === null || val === "" ? null : parseInt(val, 10));
                } else if(type === "time") {
                    if(typeof(val) === "undefined" || val === null || val === "") {
                        $this.val(null);
                    } else if(typeof(val) === "number") {
                        $this.val(BTDate.secondsToStringTime(val * 60, BTDate.HHMM));
                    } else {
                        $this.val(val);
                    }
                } else {
                    $this.val(typeof(val) === "undefined" || val === null || val === "" ? null : val);
                }
            });

            return this;
        };
    }

    if(!jQuery.fn.getValue) {
        jQuery.fn.getValue = function(defValue) {
            if(!this.get(0)) {
                return (typeof(defValue) !== "undefined" ? defValue : null);
            }

            var str = this.val();
            if(this.get(0).nodeName !== "INPUT") {
                return str ? str : (typeof(defValue) !== "undefined" ? defValue : null);
            }
            var type = this.attr("type");
            if(type === "number") {
                return str ? parseInt(str, 10) : (typeof(defValue) !== "undefined" ? defValue : null);
            } else if(type === "time") {
                return str ? Math.round(BTDate.stringTimeToSeconds(str) / 60) : (typeof(defValue) !== "undefined" ? defValue : null);
            } else {
                return str ? str : (typeof(defValue) !== "undefined" ? defValue : null);
            }
        };
    }

    if(!jQuery.fn.moveObjectToVisibleArea) {
        /**
         * @param {int} [xx]
         * @param {int} [yy]
         * @returns {jQuery}
         */
        jQuery.fn.moveObjectToVisibleArea = function (xx, yy) {
            this.each(function () {
                var obj = jQuery(this);
                var tmp = obj.css("position");
                if (tmp !== "absolute" && tmp !== "fixed") {
                    return;
                }

                var wndw = jQuery(window).width();
                var wndh = jQuery(window).height();
                if (typeof(xx) === "undefined" || xx === null) {
                    xx = parseInt(obj.position().left, 10);
                }
                if (typeof(yy) === "undefined" || yy === null) {
                    yy = parseInt(obj.position().top, 10);
                }
                var ww = obj.width();
                var hh = obj.height();
                if (xx < 0) {
                    obj.leftPos(0);
                } else if ((xx + ww) > wndw) {
                    obj.leftPos(wndw - ww);
                } else if (xx !== parseInt(obj.css("left"), 10)) {
                    obj.css("left", xx + "px");
                }
                if (yy < 0) {
                    obj.topPos(0);
                } else if ((yy + hh) > wndh) {
                    obj.topPos(wndh - hh);
                } else if (yy !== parseInt(obj.css("top"), 10)) {
                    obj.css("top", yy + "px");
                }
            });
            return this;
        };
    }

    if(!jQuery.fn.contentEditable) {
        /**
         * @param {boolean} [newState]
         * @returns {jQuery}
         */
        jQuery.fn.contentEditable = function(newState) {
            this.each(function () {
                if(this && this.setAttribute && this.removeAttribute) {
                    if(newState) {
                        this.setAttribute("contentEditable", true);
                    } else {
                        this.removeAttribute("contentEditable");
                    }
                }
            });
            return this;
        };
    }

    if(!jQuery.fn.getClosest) {
        /**
         * @param {string} selector
         * @returns {jQuery}
         */
        jQuery.fn.getClosest = function(selector) {
            var classNames = selector.replace(/\./g, " ").trim();
            if(this.hasClass(classNames)) return this;
            return this.closest(selector);
        };
    }

    if(!jQuery.fn.scrollIntoViewIfNeeded) {
        /**
         * @param {boolean} [bVal]
         * @returns {jQuery}
         */
        jQuery.fn.scrollIntoViewIfNeeded = function(bVal) {
            this.each(function() {
                this.scrollIntoViewIfNeeded(bVal);
            });
            return this;
        };
    }

    if(!jQuery.fn.scrollIntoView) {
        /**
         * @param {boolean} [bVal]
         * @returns {jQuery}
         */
        jQuery.fn.scrollIntoView = function(bVal) {
            this.each(function() {
                this.scrollIntoView(bVal);
            });
            return this;
        };
    }
})();
