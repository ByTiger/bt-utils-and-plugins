/*******************************************************************
 * @copyright © Aliaksei Puzenka, 2013-2017
 * @copyright © bytiger.com, 2013-2017
 * @version 1.0.3
 * @description
 * BTDate is JavaScript library to make easier your development work.
 * The BTDate contain functions to work with date and times values.
 * @license
 * This software is allowed to use under "GPL v3" (http://www.gnu.org/licenses/old-licenses/gpl-3.0.html)
 * or you need to obtain commercial license to use it in non-"GPL v3" project.
 * For more info please contact support@bytiger.com for details.
 *******************************************************************/

 (function(window) {
    "use strict";

    /**
     * convert string/number/Date to new date object (with fix for safari)
     * @param {string|Number|Date} [date] -- skip or set to NULL to get current time
     * @param {int} [hh]
     * @param {int} [mm]
     * @param {int} [ss]
     * @param {int} [ms]
     * @returns {Date}
     */
    window.ToDate = function(date, hh, mm, ss, ms) {
        var tmp;
        var res = null;
        if(typeof(date) === "undefined" || !date) {
            res = new Date();
        } else if(date instanceof Date) {
            res = new Date(date)
        } else if (typeof(date) === "string" && /^\d{4}\-\d{2}\-\d{2}/.test(date)) {
            tmp = date.split(/\D/).filter(function(v){ return !!v; });
            if(tmp.length >= 3) {
                res = new Date(
                    parseInt(tmp[0], 10), // year
                    parseInt(tmp[1], 10) - 1, // month
                    parseInt(tmp[2], 10), // day
                    tmp.length >= 4 ? parseInt(tmp[3], 10) : 0, // hours
                    tmp.length >= 5 ? parseInt(tmp[4], 10) : 0, // minutes
                    tmp.length >= 6 ? parseInt(tmp[5], 10) : 0, // seconds
                    0 // ms
                );
            } else {
                res = null;
            }
        } else {
            res = new Date(date);
            if(isNaN(res)) res = null;
        }

        if(res instanceof Date && !isNaN(res) && typeof(hh) === "number") {
            res.setHours(hh, mm ? mm : 0, ss ? ss : 0, ms ? ms : 0);
        }

        return res;
    };

    window.BTDate = {
        _lOneDay: 24 * 60 * 60 * 1000,
        HHMM: "HH:MM",
        HHMMSS: "HH:MM:SS",
        SQLDate: "yyyy-mm-dd",
        SQLDateTime: "yyyy-mm-dd HH:MM:SS",
        ISO: "yyyy-mm-ddTHH:MM:SSTZHM",

        /**
         * set time by copying from Date or parsing from string (HH:MM:SS),
         * note: the number in "time" field will be used as timestamp
         * @param {Date|Number|string} date
         * @param {Date|Number|string} time
         * @returns {Date}
         */
        setTime: function(date, time) {
            if(!time) {
                return null;
            }

            var dRes = ToDate(date);
            if(time && (time instanceof Date || typeof(time) === "number")) {
                var dt = ToDate(time);
                dRes.setHours(dt.getHours(), dt.getMinutes(), dt.getSeconds(), dt.getMilliseconds());
            } else if(typeof(time) === "string") {
                var tmp = time.split(":");
                dRes.setHours(tmp[0] ? tmp[0] : 0, tmp[1] ? tmp[1] : 0, tmp[2] ? tmp[2] : 0, 0);
            }
            return dRes;
        },

        /**
         * get interval between two year-weeks
         * note: the weeks starts from monday
         * note: interval calculated by start of weeks
         * @param {Date|Number|string} start
         * @param {Date|Number|string} end
         * @returns {number}
         */
        getIntervalInWeeks: function(start, end) {
            var diff = this.getIntervalInDays(this.getStartOfWeek(start), this.getStartOfWeek(end));
            return Math.floor(diff / 7);
        },

        /**
         * get interval between two dates in days
         * @param {Date|Number|string} start
         * @param {Date|Number|string} end
         * @returns {number}
         */
        getIntervalInDays: function(start, end) {
            var d1 = ToDate(start).setHours(0, 0, 0, 0);
            var d2 = ToDate(end).setHours(0, 0, 0, 0);
            return Math.floor((d2 - d1) / this._lOneDay);
        },

        /**
         * get interval between two dates in seconds
         * @param {Date|Number|string} start
         * @param {Date|Number|string} end
         * @returns {number}
         */
        getIntervalInSeconds: function(start, end) {
            if(!start || !end) return null;
            var d1 = ToDate(end).getTime() - ToDate(start).getTime();
            return Math.floor(d1 / 1000);
        },

        /**
         * get interval between two dates as string
         * format: should contain single or double letters D,H,M,S as mask and other as is
         * format ex: "DD.HH:MM:SS", "D.HH:MM:SS", "H:MM"...
         * @param {Date|Number|string} start
         * @param {Date|Number|string} end
         * @param {string} [format] - HH:MM:SS by default
         * @returns {string}
         */
        getIntervalInStringFormat: function(start, end, format) {
            if(!format) format = this.HHMMSS;
            var ms = ToDate(end).getTime() - ToDate(start).getTime();
            return this.millisecondsToStringTime(ms, format);
        },

        /**
         * get interval between two dates as string rounded by lower value
         * the time rounded to seconds or minutes (depends on usage them in format)
         * format: should contain single or double letters D,H,M,S as mask and other as is
         * format ex: "DD.HH:MM:SS", "D.HH:MM:SS", "H:MM"...
         * @param {Date|Number|string} start
         * @param {Date|Number|string} end
         * @param {string} [format]
         * @returns {string}
         */
        getIntervalInStringFormatRounded: function(start, end, format) {
            if(!format) format = this.HHMMSS;
            var ms = ToDate(end).getTime() - ToDate(start).getTime();
            if(format.indexOf("S") >= 0) {
                if((ms % 1000) < 500) ms -= ms % 1000;
                else ms += 1000 - ms % 1000;
            } else if(format.indexOf("M") >= 0) {
                if((ms % 60000) < 30000) ms -= ms % 60000;
                else ms += 60000 - ms % 60000;
            }
            return this.millisecondsToStringTime(ms, format);
        },

        /**
         * get common interval
         * @param {Date|Number|string} start1
         * @param {Date|Number|string} end1
         * @param {Date|Number|string} start2
         * @param {Date|Number|string} end2
         * @returns {{start:Date, end:Date}}
         */
        getIntersectInDates: function(start1, end1, start2, end2) {
            var ss = BTDate.max(start1, start2);
            var ee = BTDate.min(end1, end2);
            if (BTDate.compareByDate(ss, ee) <= 0) {
                return {"start": ss, "end": ee};
            }
            return null;
        },

        /**
         * get first day on current week (monday)
         * note: hours is set to 00:00:00
         * @param {Date|Number|string} date
         * @returns {Date}
         */
        getStartOfWeek: function(date) {
            var d1 = ToDate(date);
            d1.setHours(0, 0, 0, 0);
            var d2 = d1.getDay();
            d2 = (d2 === 0 ? 7 : d2) - 1;
            return ToDate(d1.getTime() - d2 * this._lOneDay);
        },

        /**
         * Add number of days to date
         * @param {Date|Number|string} date
         * @param {int} [count] -- 1 by default
         * @returns {Date}
         */
        addDays: function(date, count) {
            var d1 = ToDate(date);
            return ToDate(d1.setDate(d1.getDate() + (count || count === 0 ? count : 1)));
        },

        /**
         * Add number of weeks to date (equal to add `7 * count` days)
         * @param {Date|Number|string}date
         * @param {int} [count] -- 1 by default
         * @returns {Date}
         */
        addWeeks: function(date, count) {
            var d1 = ToDate(date);
            return ToDate(d1.setDate(d1.getDate() + 7 * (count || count === 0 ? count : 1)));
        },

        /**
         * get date for requested weekdey on current week
         * note: week starts from monday
         * weekDay: 1 - monday, 7 - sunday
         * @param {Date|Number|string} date
         * @param {int} weekDay
         * @returns {Date}
         */
        getDayOnCurrentWeek: function(date, weekDay) {
            var d1 = ToDate(date);
            var d2 = d1.getDay();
            d2 = ((!weekDay ? 7 : weekDay) - 1) - ((!d2 ? 7 : d2) - 1);
            return ToDate(d1.getTime() + d2 * this._lOneDay);
        },

        /**
         * Look for nearest week day (the result can be today or date in future)
         * weekDay: 1 - monday, 7 - sunday
         * @param {Date|Number|string} date
         * @param {int} weekDay
         * @returns {Date}
         */
        getNearestDayOfWeek: function (date, weekDay) {
            var dRes = ToDate(date);
            weekDay = (parseInt(weekDay, 10) + 6) % 7;
            if(isNaN(weekDay)) {
                return dRes;
            }
            var off = weekDay - ((dRes.getDay() + 6) % 7);
            dRes.setDate(dRes.getDate() + (off < 0 ? (7 + off) : off));
            return dRes;
        },

        /**
         * look for the next week day
         * weekDay: 1 - monday, 7 - sunday
         * @param {Date|Number|string} date
         * @param {int} weekDay
         * @returns {Date}
         */
        getNextWeekDay: function (date, weekDay) {
            var dRes = ToDate(date);
            weekDay = (parseInt(weekDay, 10) + 6) % 7;
            if(isNaN(weekDay)) {
                return dRes;
            }
            var off;
            if(weekDay > dRes.getDay()) off = weekDay - dRes.getDay();
            else off = ((7 + weekDay) - dRes.getDay())
            dRes.setDate(dRes.getDate() + off );
            return dRes;
        },

        /**
         * retrieve new Date object with first date in month
         * note: hours is set to 00:00:00
         * @param {Date|Number|string} date
         * @returns {Date}
         */
        getFirstDayOfMonth: function(date) {
            var dRes = ToDate(date);
            dRes.setDate(1);
            dRes.setHours(0,0,0,0);
            return dRes;
        },

        /**
         * retrieve new Date object with last date in month
         * note: hours is set to 00:00:00
         * @param {Date|Number|string} date
         * @returns {Date}
         */
        getLastDayOfMonth: function(date) {
            var dRes = ToDate(date);
            dRes.setMonth(dRes.getMonth() + 1);
            dRes.setDate(0);
            dRes.setHours(0,0,0,0);
            return dRes;
        },

        /**
         * Return first day in quarter.
         * note: hours is set to 00:00:00
         * @param {int} year
         * @param {int} quarterNum -- number of quarter from zero (0)
         * @returns {Date}
         */
        getFirstDayOfQuarter: function(year, quarterNum) {
            return new Date(year, quarterNum * 3, 1);
        },

        /**
         * Return last day in quarter.
         * note: hours is set to 00:00:00
         * @param {int} year
         * @param {int} quarterNum -- number of quarter from zero (0)
         * @returns {Date}
         */
        getLastDayOfQuarter: function(year, quarterNum) {
            return new Date(year, (quarterNum + 1) * 3, 0);
        },

        /**
         * return time from Date in seconds
         * @param {Date|Number|string} date
         * @returns {int}
         */
        getTimeInSeconds: function(date) {
            var dd = ToDate(date);
            return dd.getHours() * 3600 + dd.getMinutes() * 60 + dd.getSeconds();
        },

        /**
         * parse time string in format HH:MM[:SS] or HH.dh to seconds as int
         * @param {string} str
         * @returns {number}
         */
        stringTimeToSeconds: function(str) {
            str = str.trim();
            if(!/^\d+:\d{2}$/.test(str)) {
                str = str.replace(/,/g, ".");
                return Math.round(parseFloat(str) * 3600);
            }

            if(!str) {
                return 0;
            }
            var tmp = str.split(/\:/i);
            var sec = 0;
            var sign = 1;
            if(tmp.length >= 2) {
                var hh = parseInt(tmp[0], 10);
                if(hh < 0) sign = -1;
                sec = hh * 3600 + parseInt(tmp[1], 10) * 60;
            }
            if(tmp.length >= 3) {
                sec += parseInt(tmp[2], 10);
            }
            return sign * sec;
        },

        /**
         * convert milliseconds to string time format
         * format: should contain single or double letters D,H,M,S as mask and other as is
         * format ex: "DD.HH:MM:SS", "D.HH:MM:SS", "H:MM"...
         * @param {int} ms
         * @param {string} format
         * @returns {string|null}
         */
        millisecondsToStringTime: function(ms, format) {
            if(typeof(ms) === "undefined" || ms === null || !format) {
                return null;
            }
            var sec = Math.floor(ms / 1000);
            var sign = sec < 0 ? "-" : "";
            sec = Math.abs(sec);
            var dd = Math.floor(sec / 86400); // 24 * 60 * 60
            var hh = Math.floor((sec - dd * 86400)/ 3600);
            var mm = Math.floor((sec - dd * 86400 - hh * 3600) / 60);
            var ss = Math.floor(sec - dd * 86400 - hh * 3600 - mm * 60);

            if(format.indexOf("D") < 0) {
                hh += dd * 24;
                dd = 0;
            }

            if(dd > 0) {
                format = format.replace("DD", ("00" + dd).substr(-2)).replace("D", String(dd));
            }

            return sign + format
                    .replace("DD", String("00" + dd).substr(-2))
                    .replace("HH", (hh < 10 ? "0" : "") + hh)
                    .replace("MM", (mm < 10 ? "0" : "") + mm)
                    .replace("SS", (ss < 10 ? "0" : "") + ss)
                    .replace("D", String(dd))
                    .replace("H", String(hh))
                    .replace("M", String(mm))
                    .replace("S", String(ss));
        },

        /**
         * convert milliseconds to string time format
         * format: should contain single or double letters D,H,M,S as mask and other as is
         * format ex: "DD.HH:MM:SS", "D.HH:MM:SS", "H:MM"...
         * @param {int} seconds
         * @param {string} [format] -- HH:MM by default
         * @returns {string}
         */
        secondsToStringTime: function(seconds, format) {
            if(!format) format = this.HHMM;
            return this.millisecondsToStringTime(seconds * 1000, format);
        },

        /**
         * Convert seconds to rounded string time value as string by format
         * format: should contain single or double letters D,H,M,S as mask and other as is
         * format ex: "DD.HH:MM:SS", "D.HH:MM:SS", "H:MM"...
         * @param {int} seconds
         * @param {string} [format] -- HH:MM by default
         * @returns {string}
         */
        secondsToStringTimeRounded: function(seconds, format) {
            if(!format) format = this.HHMM;
            if(format.indexOf("M") >= 0) {
                if((seconds % 60) < 30) seconds -= seconds % 60;
                else seconds += 60 - seconds % 60;
            } else if(format.indexOf("H") >= 0) {
                if((seconds % 3600) < 1800) seconds -= seconds % 3600;
                else seconds += 3600 - seconds % 3600;
            }

            return this.millisecondsToStringTime(seconds * 1000, format);
        },

        /**
         * compare two dates without time values
         * note: good for sort functions
         * @param {Date|Number|string} d1
         * @param {Date|Number|string} d2
         * @returns {number}
         */
        compareByDate: function(d1, d2) {
            var dd1 = ToDate(d1, 0);
            var dd2 = ToDate(d2, 0);
            return dd1.getTime() - dd2.getTime();
        },

        /**
         * compare two dates
         * note: good for sort functions
         * @param {Date|Number|string} d1
         * @param {Date|Number|string} d2
         * @returns {number}
         */
        compareByDateTime: function(d1, d2) {
            var dd1 = ToDate(d1);
            var dd2 = ToDate(d2);
            return dd1.getTime() - dd2.getTime();
        },

        /**
         * formatted output
         * @param {Date|Number|string} date
         * @param {string} format
         * @returns {string}
         */
        format: function(date, format) {
            date = ToDate(date);
            var str;
            str = format.replace(/yyyy/, ("00" + date.getFullYear()).substr(-4));
            str = str.replace(/mm/, ("00" + (date.getMonth() + 1)).substr(-2));
            str = str.replace(/dd/, ("00" + date.getDate()).substr(-2));
            str = str.replace(/HH/, ("00" + date.getHours()).substr(-2));
            str = str.replace(/MM/, ("00" + date.getMinutes()).substr(-2));
            str = str.replace(/SS/, ("00" + date.getSeconds()).substr(-2));
            if(str.indexOf("TZHM") >= 0) {
                var tzo = date.getTimezoneOffset();
                var hh = ("00" + Math.floor(Math.abs(tzo) / 60)).substr(-2);
                var mm = ("00" + Math.floor(Math.abs(tzo) % 60)).substr(-2);
                str = str.replace(/TZHM/, (tzo < 0 ? "+" : "-") + hh + ":" + mm);
            }
            return str;
        },

        /**
         * set new time value
         * @param {Date|Number|string} date
         * @param {int} hour
         * @param {int} [minutes]
         * @param {int} [seconds]
         * @param {int} [ms]
         * @returns {Date}
         */
        setHours: function (date, hour, minutes, seconds, ms) {
            return ToDate(ToDate(date).setHours(hour, minutes ? minutes : 0, seconds ? seconds : 0, ms ? ms : 0));
        },

        /**
         * add time to Date object
         * @param {Date|Number|string} date
         * @param {int} hour
         * @param {int} [minutes]
         * @param {int} [seconds]
         * @param {int} [ms]
         * @returns {Date}
         */
        addHours: function (date, hour, minutes, seconds, ms) {
            return new Date(ToDate(date).getTime() + ((hour * 60 + (minutes ? minutes : 0)) * 60 + (seconds ? seconds : 0)) * 1000 + (ms ? ms : 0));
        },

        /**
         * @param {Date|Number|string} date
         * @returns {boolean}
         */
        isLeapYear: function (date) {
            var year = ToDate(date).getFullYear();
            return (((year % 4 === 0) && (year % 100 !== 0)) || (year % 400 === 0));
        },

        /**
         * @param {Date|Number|string} date
         * @returns {int}
         */
        getDaysInMonth: function(date) {
            var dd = ToDate(date);
            return 33 - (new Date(dd.getFullYear(), dd.getMonth(), 33)).getDate();
        },

        /**
         * Return date of first monday in year
         * @param {int} year
         * @returns {Date}
         */
        getFirstMondayInYear: function(year) {
            var dRes = new Date(year, 0, 1);
            var off = 0 - ((dRes.getDay() + 6) % 7);
            dRes.setDate(dRes.getDate() + (off < 0 ? 7 + off : off));
            return dRes;
        },

        /**
         * calculate start date of week in year
         * note: the first week starts from first monday in year
         * @param {int} year
         * @param {int} weekNo
         * @returns {Date}
         */
        getStartOfWeekByWeekNo: function(year, weekNo) {
            var dRes = new Date(year, 0, 1);
            var off = 0 - ((dRes.getDay() + 6) % 7);
            dRes.setDate((off < 0 ? 7 + off : off) + 7 * (weekNo - 1));
            return dRes;
        },

        /**
         * @param {Date|Number|string} date1
         * @param {Date|Number|string} date2
         * @returns {Date}
         */
        min: function(date1, date2) {
            return ToDate(date1).getTime() > ToDate(date2).getTime() ? ToDate(date2) : ToDate(date1);
        },

        /**
         * @param {Date|Number|string} date1
         * @param {Date|Number|string} date2
         * @returns {Date}
         */
        max: function(date1, date2) {
            return ToDate(date1).getTime() > ToDate(date2).getTime() ? ToDate(date1) : ToDate(date2);
        }
    };
})(window);
