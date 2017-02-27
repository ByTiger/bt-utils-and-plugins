# `BTDate`

The BTDate is collection of functions to work with date and time values.

### `ToDate(date)`

Create new Date object from value. Set to NULL or `undefined` to get current time.

* `date` (Date|Number|string)

*Examples:*
```javascript
var d = ToDate(Date.now());
console.log(d);
```

```javascript
var d = ToDate("2016-05-24");
console.log(d);
```

```javascript
var d = ToDate("2016-05-24 12:00");
console.log(d);
```

```javascript
var d = ToDate("2016-05-24 12:00:40");
console.log(d);
```

```javascript
var d = ToDate("2016-05-24T12:00:40");
console.log(d);
```

```javascript
var d = ToDate(Date.now());
console.log(d);
```

```javascript
var d = ToDate(0);
console.log(d);
```

```javascript
var d1 = new Date(2016, 0, 1, 10, 0, 0, 0);
var d2 = ToDate();
d1.setHours(0,0,0,0);
console.log(d1, d2);
```


### `BTDate.setTime(date, time)`

Set new time value to date.

* `date` (Date|Number|string)
* `time` (Date|Number|string)

*NOTE:* Return new Date object.

*Examples:*
```javascript
var d1 = new Date(2016, 0, 1, 10, 0, 0, 0);
var d2 = BTDate.setTime(d1, "15:00");
console.log(d1, d2);
```

```javascript
var d1 = new Date(2016, 0, 1, 10, 0, 0, 0);
var d2 = BTDate.setTime(Date.now(), "15:00:12");
console.log(d1, d2);
```

```javascript
var d1 = new Date(2016, 0, 1, 10, 0, 0, 0);
var d2 = BTDate.setTime("2001-02-25", d1);
console.log(d1, d2);
```

### `BTDate.getIntervalInWeeks(start, end)`

Get interval between two weeks (used weeks of year, that mean the the weeks starts from monday).

* `start` (Date|Number|string)
* `end` (Date|Number|string)

### `BTDate.getIntervalInDays(start, end)`

Get interval between two dates in days.

* `start` (Date|Number|string)
* `end` (Date|Number|string)

### `BTDate.getIntervalInSeconds(start, end)`

get interval between two dates in seconds

* `start` (Date|Number|string)
* `end` (Date|Number|string)

### `BTDate.getIntervalInStringFormat(start, end, format)`

get interval between two dates as string
*Format:* should contain single or double letters D,H,M,S as mask and other as is.
*Format example:* "DD.HH:MM:SS", "D.HH:MM:SS", "H:MM"...

* `start` (Date|Number|string)
* `end` (Date|Number|string)
* `format` (string)

### `BTDate.getIntervalInStringFormatRounded(start, end, format)`

Get interval between two dates as string rounded by lower value.
The time rounded to seconds or minutes (depends on what used in format).
*Format:* should contain single or double letters D,H,M,S as mask and other as is.
*Format example:* "DD.HH:MM:SS", "D.HH:MM:SS", "H:MM"...

* `start` (Date|Number|string)
* `end` (Date|Number|string)
* `format` (string)

### `BTDate.getIntersectInDates(start1, end1, start2, end2)`

Calculate period that overlapped by both defined periods.
* `start1` (Date|Number|string)
* `end1` (Date|Number|string)
* `start2` (Date|Number|string)
* `end2` (Date|Number|string)

Return object as: 
* {"start":Date, "end":Date}

### `BTDate.getStartOfWeek(date)`

Get first day on current week (monday)

*Note:* hours is set to 00:00:00

* `date` (Date|Number|string)

### `BTDate.addDays(date, count)`

Add number of days to date.

* `date` (Date|Number|string)
* `count` (int) - default: 1

### `BTDate.addWeeks(date, count)`

Add number of weeks to date (equal to add `7 * count` days).

* `date` (Date|Number|string)
* `count` (int) - default: 1

### `BTDate.getDayOnCurrentWeek(date, weekDay)`

Get date for requested weekdey on current week

*NOTE:* week starts from monday

*WEEKDAY:* 1 - monday, 7 - sunday

* `date` (Date|Number|string)
* `weekDay` (int)

### `BTDate.getNearestDayOfWeek (date, weekDay)`

Look for nearest week day (the result can be today or date in future).

*WEEKDAY:* 1 - monday, 7 - sunday

* `date` (Date|Number|string)
* `weekDay` (int)

### `BTDate.getNextWeekDay (date, weekDay)`

Look for the next week day (the result will be date in future).

* `date` (Date|Number|string)
* `weekDay` (int)

### `BTDate.getFirstDayOfMonth(date)`

Retrieve new Date object with first date in month

*NOTE:* Hours is set to `00:00:00`

* `date` (Date|Number|string)

### `BTDate.getLastDayOfMonth(date)`

Retrieve new Date object with last date in month

*NOTE:* Hours is set to `00:00:00`

* `date` (Date|Number|string)

### `BTDate.getFirstDayOfQuarter(year, quarterNum)`

Return first day in quarter.

*NOTE:* Hours is set to `00:00:00`

* `year` (int)
* `quarterNum` (int)

### `BTDate.getLastDayOfQuarter(year, quarterNum)`

Return last day in quarter.

*NOTE:* Hours is set to `00:00:00`

* `year` (int)
* `quarterNum` (int)

### `BTDate.getTimeInSeconds(date)`

Return time from Date in seconds.

* `date` (Date|Number|string)

### `BTDate.stringTimeToSeconds(str)`

Parse time string in format HH:MM[:SS] to seconds as int

* `str` (string)

### `BTDate.millisecondsToStringTime(ms, format)`

Convert milliseconds to string time format.

*FORMAT:* should contain single or double letters D,H,M,S as mask and other as is

*FORMAT EXAMPLE:* "DD.HH:MM:SS", "D.HH:MM:SS", "H:MM"...

* `ms` (int)
* `format` (string)

### `BTDate.secondsToStringTime(seconds, format)`

Convert seconds to string time format.

*FORMAT:* should contain single or double letters D,H,M,S as mask and other as is

*FORMAT EXAMPLE:* "DD.HH:MM:SS", "D.HH:MM:SS", "H:MM"...

* `seconds` (int)
* `format` (string)

### `BTDate.secondsToStringTimeRounded(seconds, format)`


Convert seconds to rounded string time value as string by format.

*FORMAT:* should contain single or double letters D,H,M,S as mask and other as is

*FORMAT EXAMPLE:* "DD.HH:MM:SS", "D.HH:MM:SS", "H:MM"...

* `seconds` (int)
* `format` (string) -- default: HH:MM

### `BTDate.compareByDate(d1, d2)`

Compare two dates without time values.

*NOTE:* Good for sort functions.

* `d1` (Date|Number|string)
* `d2` (Date|Number|string)

### `BTDate.compareByDateTime(d1, d2)`

Compare two dates with time.

*NOTE:* Good for sort functions.

* `d1` (Date|Number|string)
* `d2` (Date|Number|string)

### `BTDate.format(date, format)`

Formatted output.

* `date` (Date|Number|string)
* `format` (string)

### `BTDate.setHours (date, hour, minutes, seconds, ms)`

Set new time value.

* `date` (Date|Number|string)
* `hour` (int)
* `minutes` (int) -- default: 0
* `seconds` (int) -- default: 0
* `ms` (int) -- default: 0

### `BTDate.addHours (date, hour, minutes, seconds, ms)`

Add time.

* `date` (Date|Number|string)
* `hour` (int)
* `minutes` (int) -- default: 0
* `seconds` (int) -- default: 0
* `ms` (int) -- default: 0

### `BTDate.isLeapYear (date)`

Check is leap year.

* `date` (Date|Number|string)

### `BTDate.getDaysInMonth(date)`

Return number of days in month (or last possible day for defined month).

* `date` (Date|Number|string)

### `BTDate.getFirstMondayInYear(year)`

Return date of first monday in year.

* `year` (int)

### `BTDate.getStartOfWeekByWeekNo(year, weekNo)`

Calculate start date of week in year.

*NOTE:* The first week starts from first monday in year.

### `BTDate.min(date1, date2)`

Return min date

* `date1` (Date|Number|string)
* `date2` (Date|Number|string)

Return:

* {Date}

### License

Software placed here are licensed under the [GPL v3 license](http://www.gnu.org/licenses/gpl-3.0.html)

It's means:
- You CAN'T remove this license or attribution from files
- You CAN modify provided code in any way which doesn't conflict with above statement
- You CAN use this all or patricullary for any private projects which you do not plan to share or sell
- You CAN use this all or patricullary for public projects, BUT in such case you MUST share full source code of your project if asked

If you do not want to share sources then you need to obtain a commercial license at bytiger.com
