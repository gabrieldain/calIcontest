/**
 * Datetime Control
 * @Date 2010-04-22
 * @Author Daniel Gong
 * This script turn all input boxes that with a class name containing dateControl or timeControl or datetimeControl into ActionStep_DatetimeControl objects when page loads
 *
 * HOW TO USE:
 * create a normal input text box and give it a class name containing any of the three valid values: dateControl, timeControl, datetimeControl
 * e.g. <input type='text' name='anyName' id='myControl' value='' class='dateControl' />
 * You could also use STYLE, ONCHANGE attributes to customise your control
 *
 * To create a control manually use
 * ActionStep_DatetimeControl.init(HtmlElement_or_ID, ActionStep_DatetimeControl.DATETIME_CONTROL);
 * ActionStep_DatetimeControl.init(HtmlElement_or_ID, ActionStep_DatetimeControl.DATE_CONTROL);
 * ActionStep_DatetimeControl.init(HtmlElement_or_ID, ActionStep_DatetimeControl.TIME_CONTROL);
 *
 * an instance of ActionStep_DatetimeControl will be attached to HtmlElement_or_ID, i.e. HtmlElement.ActionStep_DatetimeControl = datetimeControl;
 * you can use
 * HtmlElement.ActionStep_DatetimeControl.setDate() for ActionStep_DatetimeControl.DATE_CONTROL
 * HtmlElement.ActionStep_DatetimeControl.setTime() for ActionStep_DatetimeControl.TIME_CONTROL
 * HtmlElement.ActionStep_DatetimeControl.setDatetime() for ActionStep_DatetimeControl.DATETIME_CONTROL
 * to set new date value if you need
 */
var ActionStep_DatetimeControl = {
    // control type constants
    DATE_CONTROL: 0,
    TIME_CONTROL: 1,
    DATETIME_CONTROL: 2,
    DATEMEMO_CONTROL: 3,
    DATETIMEMEMO_CONTROL: 4,

    CONFIG: {
        dateFormat: 'DDMMYYYY',
        firstWeekday: 1 // 0 sunday, 1 monday, 2 tuesday...
    },

    autoInit: function(){
        var inputsToConvert = [];
        var inputs = document.getElementsByTagName('input');
        for (var i=0; i<inputs.length; i++){
            if (inputs[i].className.indexOf('datetimeControl') !== -1){
                inputsToConvert.push([inputs[i], ActionStep_DatetimeControl.DATETIME_CONTROL]);
            } else if (inputs[i].className.indexOf('dateControl') !== -1){
                inputsToConvert.push([inputs[i], ActionStep_DatetimeControl.DATE_CONTROL]);
            } else if (inputs[i].className.indexOf('timeControl') !== -1){
                inputsToConvert.push([inputs[i], ActionStep_DatetimeControl.TIME_CONTROL]);
            } else if (inputs[i].className.indexOf('dateMemoControl') !== -1){
                inputsToConvert.push([inputs[i], ActionStep_DatetimeControl.DATEMEMO_CONTROL]);
            } else if (inputs[i].className.indexOf('datetimeMemoControl') !== -1){
                inputsToConvert.push([inputs[i], ActionStep_DatetimeControl.DATETIMEMEMO_CONTROL]);
            }
        }
        // init will create new input elements in DOM, cannot do init in the first for loop
        for (var i=0; i<inputsToConvert.length; i++){
            ActionStep_DatetimeControl.init(inputsToConvert[i][0], inputsToConvert[i][1]);
        }
    },

    init: function(input, type){
        var weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        for (var i=0; i<weekdays.length; i++){
            if (weekdays[i] == ActionStep_Locale.getFirstDayNameOfTheWeek()){
                ActionStep_DatetimeControl.CONFIG.firstWeekday = i;
            }
        }

        input = ActionStep_DatetimeControl.$(input);

        if (input.ActionStep_DatetimeControl) return;

        switch(type){
            case ActionStep_DatetimeControl.DATETIME_CONTROL:
                input.ActionStep_DatetimeControl = new ActionStep_DatetimeControl.DatetimeControl(input);
                break;
            case ActionStep_DatetimeControl.TIME_CONTROL:
                input.ActionStep_DatetimeControl = new ActionStep_DatetimeControl.TimeControl(input);
                break;
            case ActionStep_DatetimeControl.DATETIMEMEMO_CONTROL:
                input.ActionStep_DatetimeControl = new ActionStep_DatetimeControl.DatetimeMemoControl(input);
                break;
            case ActionStep_DatetimeControl.DATEMEMO_CONTROL:
                input.ActionStep_DatetimeControl = new ActionStep_DatetimeControl.DateMemoControl(input);
                break;
            default:
                input.ActionStep_DatetimeControl = new ActionStep_DatetimeControl.DateControl(input);
                break;
        }
    },

    DateUtils: {
        TODAY: new Date(),

        /**
         * get textual representation from numeric.
         * Note: 0 = Jan, 11 = Dec, this is JS convention from Date object
         *
         * @param int month - month in numeric
         */
        getMonthName: function(month){
            var months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
            return months[month];
        },

        // constants: weekday name format
        WEEKNAME_FULL: 0,
        WEEKNAME_SHORT: 1,
        WEEKNAME_SHORTER: 2,
        /**
         * get textual representation from numeric.
         * Note: 0 = Sunday, 6 = Saturday, this is JS convention from Date object
         *
         * @param int day - weekday in numeric
         * @param int format - format constant
         */
        getWeekdayName: function(day, format){
            var weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
            switch(format){
                case ActionStep_DatetimeControl.DateUtils.WEEKNAME_SHORTER:
                    return weekdays[day].charAt(0);
                    break;
                case ActionStep_DatetimeControl.DateUtils.WEEKNAME_SHORT:
                    return weekdays[day].substr(0, 3);
                    break;
                default:
                    return weekdays[day];
                    break;
            }
        },

        /**
         * returns day of the week based the AS_Config.firstWeekday. e.g if firstWeekday is 1 (Monday) then monday would be 1, firstWeekday is 1 (Tuesday) then monday would be 0
         *
         * @param Date date - a date object representing the day
         * @return int - day of the week (0 - 6)
         */
        getDay: function(date){
            return (7 + date.getDay() - (ActionStep_DatetimeControl.CONFIG.firstWeekday - 1)) % 7;
        },

        /**
         * get complete year string from 1 or 2 numbers. e.g. 1 => 2001, 10 => 2010, 98 => 1998, null or '' => current year
         *
         * @param int|string year - numbers e.g. 1, 10
         * @return string - full year string e.g. 2001
         */
        getCompleteYear: function(year){
            if (year === null || year === '' || isNaN(year)) return ActionStep_DatetimeControl.DateUtils.TODAY.getFullYear(); // .toString();
            if (year.length == 1) year = '0' + year; // new Date().getFullYear().toString().charAt(2) + year
            if (year.length == 2) year = (year > 50) ? '19' + year : '20' + year;
            return year;
        },

        /**
         * Convert a date string to Date object, if dateString is empty, will return false
         *
         * @param String dateString - a date string, could be in any format from below
         * @testCases: {
                        echo("Sep 50 2010 => " + ActionStep_DatetimeControl.DateUtils.parseDate('Sep 50 2010').toDateString());
                        echo("9 39 2010 => " + ActionStep_DatetimeControl.DateUtils.parseDate('9 39 2010').toDateString());
                        echo("50 Sep 2010 => " + ActionStep_DatetimeControl.DateUtils.parseDate('50 Sep 2010').toDateString());
                        echo("25 2009 9 => " + ActionStep_DatetimeControl.DateUtils.parseDate('25 2009 9').toDateString());
                        echo("25 2009 Sep => " + ActionStep_DatetimeControl.DateUtils.parseDate('25 2009 Sep').toDateString());
                        echo("25 25 2009 => " + ActionStep_DatetimeControl.DateUtils.parseDate('25 25 2009').toDateString());
                        echo("2009-09-25 => " + ActionStep_DatetimeControl.DateUtils.parseDate('2009-09-25').toDateString());
                        echo("2009 09 25 => " + ActionStep_DatetimeControl.DateUtils.parseDate('2009 09 25').toDateString());
                        echo("25/09/2009 => " + ActionStep_DatetimeControl.DateUtils.parseDate('25/09/2009').toDateString());
                        echo("25/09/09 => " + ActionStep_DatetimeControl.DateUtils.parseDate('25/09/09').toDateString());
                        echo("25 9 09 => " + ActionStep_DatetimeControl.DateUtils.parseDate('25 9 09').toDateString());
                        echo("25 9 => " + ActionStep_DatetimeControl.DateUtils.parseDate('25 9').toDateString());
                        echo("2009 Sep 25 => " + ActionStep_DatetimeControl.DateUtils.parseDate('2009 Sep 25').toDateString());
                        echo("Sep 25 2009 => " + ActionStep_DatetimeControl.DateUtils.parseDate('Sep 25 2009').toDateString());
                        echo("25 Sep 2009 => " + ActionStep_DatetimeControl.DateUtils.parseDate('25 Sep 2009').toDateString());
                        echo("25 Sep 09 => " + ActionStep_DatetimeControl.DateUtils.parseDate('25 Sep 09').toDateString());
                        echo("Sep 25 9 => " + ActionStep_DatetimeControl.DateUtils.parseDate('Sep 25 9').toDateString());
                        echo("Sep 25 => " + ActionStep_DatetimeControl.DateUtils.parseDate('Sep 25').toDateString());
                        echo("25 Sep => " + ActionStep_DatetimeControl.DateUtils.parseDate('25 Sep').toDateString());
                        function echo(str){ document.getElementById('echo').innerHTML += str + '<br />';}
                    }
         * @return Date	- javascript date object representing the date string or False if dateString is empty
         */
        parseDate: function(dateString){
            if (isEmpty(dateString)) return false;
            var translatedDateString = ActionStep_Locale.getDateFromEntryFormat(dateString);
            if (translatedDateString !== false) dateString = translatedDateString;

            var day = null, month = null, year = null;

            // get numbers and strings from dateString
            var parts = dateString.match(/\d+|[a-z]+/gi);
            if (parts){
                for (var i=0; i<parts.length; i++){
                    if (isNaN(parts[i])){  // if is string (sep, aug etc)
                        if (month != null) day = month; // this is case like "2009 10 Sep"
                        month = parts[i];
                    } else if (parts[i].length == 4){
                        year = parts[i];
                    } else if (month == null){ // 1st non 4 digit number, month has priority. i.e. default date format is mm-dd-yyyy
                        month = parts[i];
                    } else if (day == null){ // 2nd number or 1st number (if month is string)
                        day = parts[i];
                    } else if (year == null){ // last number
                        year = parts[i].substr(0, 4);
                    }
                }

                var useNZformat = ActionStep_DatetimeControl.CONFIG.dateFormat == 'DDMMYYYY' && parts[0].length != 4;
                if (!isNaN(month) && (useNZformat && day <= 12 || month > 12 && day <= 12)){ // swap for NZ format only if month is not > 12
                    var tmp = month;
                    month = day;
                    day = tmp;
                }
            }

            if (day == null) day = ActionStep_DatetimeControl.DateUtils.TODAY.getDate();

            if (month == null) month = ActionStep_DatetimeControl.DateUtils.TODAY.getMonth() + 1;
            if (!isNaN(month)) month = (month - 1) % 12;

            year = ActionStep_DatetimeControl.DateUtils.getCompleteYear(year);

            // new Date() in Safari does not recoganize format "YYYY MM DD" (MM can be textual)
            var returnDate = isNaN(month) ? new Date(month + ' ' + day + ' ' + year) : new Date(year, month, day);

            if (isNaN(returnDate)) return ActionStep_DatetimeControl.DateUtils.TODAY;
            // day is bigger than the maximum day of the month, use last day of the month
            // potiential problem with below calculation is if day is over 60, e.g. 2009 1 62, it will return 2009 2 28 rather than expected 2009 1 31
            // but this bug is reasonable as this calculation is only a quick fix for people whos not sure about the last day of the month, e.g. Sep 31 => sep 30, Feb 30 => feb 28
            // if the input value is something like 50, 90 etc, this is not a reasonable input in the first place anyway, no need to deal with it.
            if (returnDate.getDate() != day) returnDate = new Date(year, returnDate.getMonth(), 0);
            return returnDate;
        },

        // constants: date string format
        DATE_STRING_FULL: 0, // Wednesday, 14 February 2009
        DATE_STRING_INPUT: 1, // 14/02/2009
        DATE_STRING_DB: 2, // 2009-02-14
        /**
         * Convert Date object into date string
         *
         * @param Date date - date object
         * @param int format - format constant
         * @return String - a formatted date string or an empty string if $date is false/null
         */
        getDateString: function(date, format){
            if (!date) return '';
            switch(format){
                case ActionStep_DatetimeControl.DateUtils.DATE_STRING_DB:
                    return date.getFullYear() + '-' + ActionStep_DatetimeControl.DateUtils.padZero(date.getMonth() + 1) + '-' + ActionStep_DatetimeControl.DateUtils.padZero(date.getDate());
                    break;
                case ActionStep_DatetimeControl.DateUtils.DATE_STRING_INPUT:
                    var month = date.getMonth() + 1;
                    return (ActionStep_DatetimeControl.CONFIG.dateFormat == 'DDMMYYYY') ? date.getDate() + '/' + month + '/' + date.getFullYear() : month + '/' + date.getDate() + '/' + date.getFullYear();
                    break;
                default:
                    var weekday = ActionStep_DatetimeControl.DateUtils.getWeekdayName(date.getDay());
                    var month = ActionStep_DatetimeControl.DateUtils.getMonthName(date.getMonth());
                    return (ActionStep_DatetimeControl.CONFIG.dateFormat == 'DDMMYYYY') ? weekday + ', ' + date.getDate() + ' ' + month + ' ' + date.getFullYear() : weekday + ', ' + month + ' ' + date.getDate() + ' ' + date.getFullYear();
                    break;
            }
        },

        /**
         * Convert a time string to Date object, if timeString is empty, will return false
         *
         * @param string timeString - a time string, could be in any format from below
         * @param bool amPmAssumption - if make assumptions on time when am pm is not specified in time string, i.e. 1 would become 1pm instead of 1am, only applys to 1 - 6
         * @testCases: {
                        echo("'' => " + typeof(ActionStep_DatetimeControl.DateUtils.parseTime('')));
                        echo("0 => " + ActionStep_DatetimeControl.DateUtils.parseTime('0').toTimeString());
                        echo("1 => " + ActionStep_DatetimeControl.DateUtils.parseTime('1').toTimeString());
                        echo("001 => " + ActionStep_DatetimeControl.DateUtils.parseTime('001').toTimeString());
                        echo("0001 => " + ActionStep_DatetimeControl.DateUtils.parseTime('0001').toTimeString());
                        echo("005 => " + ActionStep_DatetimeControl.DateUtils.parseTime('005').toTimeString());
                        echo("9 => " + ActionStep_DatetimeControl.DateUtils.parseTime('9').toTimeString());
                        echo("09 => " + ActionStep_DatetimeControl.DateUtils.parseTime('09').toTimeString());
                        echo("009 => " + ActionStep_DatetimeControl.DateUtils.parseTime('009').toTimeString());
                        echo("0009 => " + ActionStep_DatetimeControl.DateUtils.parseTime('0009').toTimeString());
                        echo("0013 => " + ActionStep_DatetimeControl.DateUtils.parseTime('0013').toTimeString());
                        echo("0019 => " + ActionStep_DatetimeControl.DateUtils.parseTime('0019').toTimeString());
                        echo("11 => " + ActionStep_DatetimeControl.DateUtils.parseTime('11').toTimeString());
                        echo("12 => " + ActionStep_DatetimeControl.DateUtils.parseTime('12').toTimeString());
                        echo("000012 => " + ActionStep_DatetimeControl.DateUtils.parseTime('000012').toTimeString());
                        echo("15 => " + ActionStep_DatetimeControl.DateUtils.parseTime('15').toTimeString());
                        echo("19 => " + ActionStep_DatetimeControl.DateUtils.parseTime('19').toTimeString());
                        echo("24 => " + ActionStep_DatetimeControl.DateUtils.parseTime('24').toTimeString());
                        echo("29 => " + ActionStep_DatetimeControl.DateUtils.parseTime('29').toTimeString());
                        echo("55 => " + ActionStep_DatetimeControl.DateUtils.parseTime('55').toTimeString());
                        echo("055 => " + ActionStep_DatetimeControl.DateUtils.parseTime('055').toTimeString());
                        echo("0055 => " + ActionStep_DatetimeControl.DateUtils.parseTime('0055').toTimeString());
                        echo("00055 => " + ActionStep_DatetimeControl.DateUtils.parseTime('00055').toTimeString());
                        echo("59 => " + ActionStep_DatetimeControl.DateUtils.parseTime('59').toTimeString());
                        echo("059 => " + ActionStep_DatetimeControl.DateUtils.parseTime('059').toTimeString());
                        echo("060 => " + ActionStep_DatetimeControl.DateUtils.parseTime('060').toTimeString());
                        echo("60 => " + ActionStep_DatetimeControl.DateUtils.parseTime('60').toTimeString());
                        echo("99 => " + ActionStep_DatetimeControl.DateUtils.parseTime('99').toTimeString());

                        echo("101 => " + ActionStep_DatetimeControl.DateUtils.parseTime('101').toTimeString());
                        echo("159 => " + ActionStep_DatetimeControl.DateUtils.parseTime('159').toTimeString());
                        echo("0159 => " + ActionStep_DatetimeControl.DateUtils.parseTime('0159').toTimeString());
                        echo("160 => " + ActionStep_DatetimeControl.DateUtils.parseTime('160').toTimeString());
                        echo("0160 => " + ActionStep_DatetimeControl.DateUtils.parseTime('0160').toTimeString());
                        echo("170 => " + ActionStep_DatetimeControl.DateUtils.parseTime('170').toTimeString());
                        echo("190 => " + ActionStep_DatetimeControl.DateUtils.parseTime('190').toTimeString());
                        echo("235 => " + ActionStep_DatetimeControl.DateUtils.parseTime('235').toTimeString());
                        echo("351 => " + ActionStep_DatetimeControl.DateUtils.parseTime('351').toTimeString());
                        echo("000351 => " + ActionStep_DatetimeControl.DateUtils.parseTime('000351').toTimeString());
                        echo("510 => " + ActionStep_DatetimeControl.DateUtils.parseTime('510').toTimeString());
                        echo("0510 => " + ActionStep_DatetimeControl.DateUtils.parseTime('0510').toTimeString());
                        echo("0909 => " + ActionStep_DatetimeControl.DateUtils.parseTime('0909').toTimeString());
                        echo("959 => " + ActionStep_DatetimeControl.DateUtils.parseTime('959').toTimeString());

                        echo("1000 => " + ActionStep_DatetimeControl.DateUtils.parseTime('1000').toTimeString());
                        echo("1010 => " + ActionStep_DatetimeControl.DateUtils.parseTime('1010').toTimeString());
                        echo("1060 => " + ActionStep_DatetimeControl.DateUtils.parseTime('1060').toTimeString());
                        echo("1099 => " + ActionStep_DatetimeControl.DateUtils.parseTime('1099').toTimeString());
                        echo("0001313=> " + ActionStep_DatetimeControl.DateUtils.parseTime('0001313').toTimeString());
                        echo("2401 => " + ActionStep_DatetimeControl.DateUtils.parseTime('2401').toTimeString());
                        echo("2559 => " + ActionStep_DatetimeControl.DateUtils.parseTime('2559').toTimeString());
                        echo("000213000 => " + ActionStep_DatetimeControl.DateUtils.parseTime('000213000').toTimeString());
                        echo("0005313 => " + ActionStep_DatetimeControl.DateUtils.parseTime('0005313').toTimeString());
                        echo("10001 => " + ActionStep_DatetimeControl.DateUtils.parseTime('10001').toTimeString());
                        echo("10030 => " + ActionStep_DatetimeControl.DateUtils.parseTime('10030').toTimeString());
                        echo("10600 => " + ActionStep_DatetimeControl.DateUtils.parseTime('10600').toTimeString());

                        echo("0.1 => " + ActionStep_DatetimeControl.DateUtils.parseTime('0.1').toTimeString());
                        echo("00.1 => " + ActionStep_DatetimeControl.DateUtils.parseTime('00.1').toTimeString());
                        echo("10.1 => " + ActionStep_DatetimeControl.DateUtils.parseTime('10.1').toTimeString());

                        echo("9am => " + ActionStep_DatetimeControl.DateUtils.parseTime('9am').toTimeString());
                        echo("9am40 => " + ActionStep_DatetimeControl.DateUtils.parseTime('9am40').toTimeString());
                        echo("40 9pm => " + ActionStep_DatetimeControl.DateUtils.parseTime('40 9pm').toTimeString());
                        echo("a351 => " + ActionStep_DatetimeControl.DateUtils.parseTime('a351').toTimeString());
                        echo("00035a1 => " + ActionStep_DatetimeControl.DateUtils.parseTime('00035a1').toTimeString());
                        echo("000351a => " + ActionStep_DatetimeControl.DateUtils.parseTime('000351a').toTimeString());
                        echo("55a => " + ActionStep_DatetimeControl.DateUtils.parseTime('55a').toTimeString());
                        echo("13 9 pm => " + ActionStep_DatetimeControl.DateUtils.parseTime('13 9 pm').toTimeString());
                        echo("23am => " + ActionStep_DatetimeControl.DateUtils.parseTime('23am').toTimeString());
                        echo("23pm => " + ActionStep_DatetimeControl.DateUtils.parseTime('23pm').toTimeString());

                        echo("am => " + ActionStep_DatetimeControl.DateUtils.parseTime('am').toTimeString());
                        echo("pm => " + ActionStep_DatetimeControl.DateUtils.parseTime('pm').toTimeString());
                        echo("40 9 => " + ActionStep_DatetimeControl.DateUtils.parseTime('40 9').toTimeString());
                        function echo(str){ document.getElementById('echo').innerHTML += str + '<br />';}
                    }
         * @return Date	- javascript date object representing the time string or False if timeString is empty
         */
        parseTime: function(timeString, amPmAssumption){
            if (isEmpty(timeString)) return false;
            var hour = null, minute = null, amPm = null;
            var parts = timeString.match(/(\d+)|[ap]/gi);
            if (parts){
                for (var i=0; i<parts.length; i++){
                    if (isNaN(parts[i])){
                        amPm = (parts[i] + 'm').toLowerCase();
                    } else if (hour === null){
                        hour = parts[i];
                    } else if (minute === null) {
                        minute = parts[i];
                    }
                }
            }

            if (hour === null){
                hour = ActionStep_DatetimeControl.DateUtils.TODAY.getHours();
                minute = (ActionStep_DatetimeControl.DateUtils.TODAY.getMinutes() > 30) ? 0 : 30; // next half hour 4.35 => 5.00, 4.20 => 4.30
                if (minute == 0) hour++; // move to next hour
            } else if (minute === null){
                // > 999, remove all preceeding 0. e.g 1234 => 12:34
                // 60 - 999, must start with one and only one 0. e.g. 0070 => 070 (7:00), 60 => 060(6:00), 159 => 0159 (1:59), 160 => 0160 (16:00)
                // 25 - 59, must start with one 0, if already contains preceeding 0, must start with two 0s. e.g. 59 => 059 (5:09), 059 => 0059 (00:59)
                // 9 - 24, if theres preceeding zero, then must start with two 0s. e.g 23 => 23 (23:00), 023 => 0023 (00:23)
                // 0 - 9, if there are two or more preceeding zeros, then must start with two 0s. e.g. 9 => 9 (9:00), 09 => 9 (9:00), 009 => 009 (00:09)
                // test cases
                // 001 => 001, 0001 => 001, 0055 => 0055, 055 => 0055, 00055 => 0055, 000012 => 0012, 000351 => 0351, 0001313 => 1313, 000213000 => 2130
                // 1 => 1, 01 => 001, 60 => 060, 060 => 060, 59 => 059, 059 => 0059, 23 => 23, 023 => 0023

                if (hour > 999) hour = hour.replace(/^0+/, '');
                else if (hour > 59) hour = '0' + hour.replace(/^0+/, '');
                else if (hour > 24) hour = '0' + hour.replace(/^0+/, '0');
                else if (hour > 9) hour = hour.replace(/^0+/, '00');
                else hour = hour.replace(/^00+/, '00');

                var minute = hour.substr(2, 2);
                var hour = hour.substr(0, 2);

                if (hour == 1 && minute > 59){ // e.g. 190 => 19:0
                    hour += minute[0]; // append first digit from minute to hour
                    minute = minute[1];
                }
            }

            // swap for a more appropriate value
            if (hour > 24 && minute < 24 && minute !== null){
                var tmp = hour;
                hour = minute;
                minute = tmp;
            }

            minute %= 60;
            hour %= 24;
            if (amPm === null && hour > 0 && hour < 7 && amPmAssumption || amPm == 'pm' && hour < 12) hour = hour * 1 + 12;

            if ((amPm == 'am') && (hour == 12)) {
                hour = 0;
            }

            var returnTime = new Date();
            returnTime.setHours(hour);
            returnTime.setMinutes(minute);
            return returnTime;
        },

        TIME_STRING_24HR: 0,
        TIME_STRING_12HR: 1,
        /**
         * Convert Date object into a time string
         *
         * @param Date time - date object
         * @param int format - format constant
         * @return String - a formatted time string or an empty string if $time is false/null
         */
        getTimeString: function(time, format){
            if (!time) return '';
            switch(format){
                case ActionStep_DatetimeControl.DateUtils.TIME_STRING_12HR:
                    var hours = (time.getHours() == 12) ? 12 : time.getHours() % 12;
                    var amPm = (time.getHours() > 11) ? 'pm' : 'am';
                    return hours + ':' + ActionStep_DatetimeControl.DateUtils.padZero(time.getMinutes()) + amPm;
                    break;
                default:
                    return ActionStep_DatetimeControl.DateUtils.padZero(time.getHours()) + ':' + ActionStep_DatetimeControl.DateUtils.padZero(time.getMinutes());
                    break;
            }
        },

        parseDateTime: function(dateTimeString){
            var dateParts = dateTimeString.split(' ');
            var date = this.parseDate(dateParts[0]);
            var time = this.parseTime(dateParts[1]);
            date.setHours(time.getHours());
            date.setMinutes(time.getMinutes());
            return date;
        },

        /**
         *
         * @param Date datetime - date object
         * @return string - a string representing the full date time, i.e. 2010-09-01 23:30
         */
        getDateTimeString: function(datetime) {
            return ActionStep_DatetimeControl.DateUtils.getDateString(datetime, this.DATE_STRING_DB) + ' ' + ActionStep_DatetimeControl.DateUtils.getTimeString(datetime);
        },

        /**
         * pad day / month / hour / min / sec with a 0 to the left if less than 10. e.g. 1 => 01
         * @return int - a two digits number
         */
        padZero: function(number) {
            return (number < 10) ? '0' + number : number;
        }
    },

    Utils: {
        addEvent: function(object, eventType, func, params){
            var callback = (params == null) ? func : function(e){ func(params, e) };
            if (object.addEventListener){
                object.addEventListener(eventType, callback, false);
            } else if (object.attachEvent){
                object.attachEvent('on' + eventType, callback);
            }
        },

        fireEvent: function(object, eventType){
            // dispatch for IE

            if (typeof(jQuery) !== 'undefined') {
                jQuery(object).trigger(eventType);
            } else {

                if (document.fireEvent){
                    object.fireEvent('on' + eventType)
                } else{
                    // dispatch for firefox + others
                    var evt = document.createEvent("HTMLEvents");
                    evt.initEvent(eventType, true, true); // event type, bubbling, cancelable
                    object.dispatchEvent(evt);
                }
            }
        }
    },

    Calendar: function(callback, defaultDate, container){
        // private vars
        var _displayDate = new Date(); // month that currently displaying
        var _selectedDate = new Date();
        var _eventCallbacks = {};

        var _callback = {
            func: null, // this function should accept two parameters, and will be called as: customFunc(_selectedDate, _callback.param)
            param: null
        }

        // create table, the container of all calendar elements
        var _calTable = ActionStep_DatetimeControl.$$('table', {className: 'AS_Calendar', id: 'AS_Calendar'});
        var _monthOption, _yearOption, _buttons;

        // private methods
        /**
         * constructor
         */
        (function _construct(){
            if (callback) setCallback(callback);
            if (defaultDate) {
                _displayDate = new Date(defaultDate);
                _selectedDate = new Date(defaultDate);
            }
            if (container) setContainer(container);

            _renderHeader();
            _renderBody();
        })();


        function _fireCallbackEvent(methodName, args) {
            if (!_eventCallbacks[methodName]) {
                return;
            }
            for (var i=0;i<_eventCallbacks[methodName].length;i++) {
                _eventCallbacks[methodName][i].method.apply(_eventCallbacks[methodName][i].context, args);
            }
        }

        /**
         * create calendar header (month/year filter and weekday header)
         */
        function _renderHeader(){
            _monthOption = _getMonthOption();
            _yearOption = _getYearOption();
            _buttons = _getButtons();

            // month/year options
            var row = _calTable.insertRow(-1);
            var cell = row.insertCell(-1);
            cell.colSpan = 7;
            cell.appendChild(_monthOption);
            cell.appendChild(_yearOption);

            // today, previous/next buttons
            row = _calTable.insertRow(-1);
            cell = row.insertCell(-1);
            cell.colSpan = 7;
            cell.appendChild(_buttons);

            // weekday headers
            row = _calTable.insertRow(-1);
            row.className = 'AS_Calendar_Header';
            // for (var i=0; i<7; i++){
            for (var i=ActionStep_DatetimeControl.CONFIG.firstWeekday; i<ActionStep_DatetimeControl.CONFIG.firstWeekday + 7; i++){
                cell = row.insertCell(-1);
                cell.innerHTML = ActionStep_DatetimeControl.DateUtils.getWeekdayName(i%7, ActionStep_DatetimeControl.DateUtils.WEEKNAME_SHORTER);
            }
        }

        /**
         * create calendar body (month days)
         */
        function _renderBody(){
            // remove day rows in table from previous rendering
            while (_calTable.rows.length > 3){ // keep top 3 header rows
                _calTable.deleteRow(-1);
            }

            var lastMonth = new Date(_displayDate);
            lastMonth.setDate(0); // last day of previous month prior _displayDate

            var thisMonth = new Date(_displayDate);
            thisMonth.setDate(32);
            thisMonth.setDate(0); // last day of _displayDate

            // var prependingDays = lastMonth.getDay();
            // var appendingDays = (thisMonth.getDay() == 0) ? 0 : 7 - thisMonth.getDay();
            var prependingDays = ActionStep_DatetimeControl.DateUtils.getDay(lastMonth);
            var appendingDays = (7 - ActionStep_DatetimeControl.DateUtils.getDay(thisMonth)) % 7;
            var monthDays = thisMonth.getDate(); // total days of _displayDate

            var totalDays = monthDays + prependingDays + appendingDays;
            var firstDayOfWeek = null;
            for (var i=1; i<=totalDays; i++){
                if (i%7 == 1) {
                    var row = _calTable.insertRow(-1);
                    firstDayOfWeek =  new Date(thisMonth);
                    firstDayOfWeek.setDate(i - prependingDays); // set date value for day cell
                }
                var cell = row.insertCell(-1);

                cell.date = new Date(thisMonth);
                cell.date.setDate(i - prependingDays); // set date value for day cell
                // cell.innerHTML = cell.date.getDate();
                cell.appendChild(document.createTextNode(cell.date.getDate()));
                var ymd = cell.date.getFullYear() + '-' + (cell.date.getMonth() < 9 ? '0' : '') + (cell.date.getMonth() + 1) + '-' + (cell.date.getDate() < 10 ? '0' : '') + cell.date.getDate();
                cell.className = 'AS_Calendar_Day Date-' + ymd;
                cell.onclick = _selectDate;

                cell.setAttribute('data-first-day-of-week', firstDayOfWeek);

                if (cell.date.toDateString() == ActionStep_DatetimeControl.DateUtils.TODAY.toDateString()) {
                    cell.className += ' AS_Calendar_Today';
                    cell.title = 'Today';
                }

                if (cell.date.toDateString() == _selectedDate.toDateString()) cell.className += ' AS_Calendar_SelectedDay';

                if (i <= prependingDays || i > monthDays + prependingDays){
                    cell.className += ' AS_Calendar_OffsetDay';
                }
            }

            _monthOption.value = _displayDate.getMonth();
            _yearOption.value = _displayDate.getFullYear();
            _fireCallbackEvent("onAfterRenderBody", []);
        }

        /**
         * onclick callback function when click on days
         */
        function _selectDate(){
            _displayDate = new Date(this.date);
            _selectedDate = new Date(this.date);
            _renderBody();
            if (_callback.func) _callback.func(_selectedDate, _callback.param);
        }

        /**
         * @return HtmlElement select - month selection drop down box
         */
        function _getMonthOption(){
            var monthOption = ActionStep_DatetimeControl.$$('select');
            for (var i=0; i<12; i++){
                var selected = (i == _displayDate.getMonth()) ? true : false;
                monthOption.options.add(new Option(ActionStep_DatetimeControl.DateUtils.getMonthName(i), i, selected, selected));
            }

            monthOption.onchange = function(){
                _displayDate.setMonth(this.value);
                _renderBody();
            }

            return monthOption;
        }

        /**
         * @return HtmlElement input - input text box for year
         */
        function _getYearOption(){
            return ActionStep_DatetimeControl.$$('input', {
                maxLength: 4,
                onkeyup: _setYear,
                onblur: _setYear,
                value: _displayDate.getFullYear()
            });
        }

        /**
         * callback event for onblur onkeyup on year input text box
         *
         * @return HtmlElement input - input text box for year
         */
        function _setYear(e){
            if (!e) var e = window.event;
            var year = this.value.replace(/\D/g, '');

            // press enter or blurred
            if (e.keyCode == 13 || document.activeElement != this) this.value = ActionStep_DatetimeControl.DateUtils.getCompleteYear(year);
            if (year.length == 4){
                _displayDate.setFullYear(year);
                _renderBody();
                _fireCallbackEvent("onAfterSetYear", []);
            }
        }

        /**
         * create Back, Next and Today buttons
         *
         * @return HtmlElement div - html for buttons
         */
        function _getButtons(){
            var buttonDiv = ActionStep_DatetimeControl.$$('div');

            // << button
            var button = ActionStep_DatetimeControl.$$('span', {innerHTML: '&lt;', title: 'Previous Month'});
            button.onclick = function(){ _changeMonth(-1); }
            buttonDiv.appendChild(button);

            // today button
            button = ActionStep_DatetimeControl.$$('span', {innerHTML: 'TODAY', className: 'AS_Calendar_TodayButton'});
            button.onclick = function(){ _changeMonth(0); }
            buttonDiv.appendChild(button);

            // >> button
            button = ActionStep_DatetimeControl.$$('span', {innerHTML: '&gt;', title: 'Next Month'});
            button.onclick = function(){ _changeMonth(1); }
            buttonDiv.appendChild(button);

            return buttonDiv;
        }

        /**
         * callback function for button events, go to previous/next month, go to today
         */
        function _changeMonth(action){
            if (action == 0){
                _selectedDate = new Date();
                _displayDate = new Date();
            } else {
                var d=_displayDate.getDate();
                _displayDate.setDate(20);
                _displayDate.setMonth(_displayDate.getMonth() + action + 1);
                _displayDate.setDate(0);
                if (_displayDate.getDate() > d) {
                    _displayDate.setDate(d);
                }

            }
            _renderBody();
        }

        // public methods
        /**
         * set container for calendar html element, append calendar into container
         * @param string|HtmlElement container - id or element object
         */
        function setContainer(container){
            ActionStep_DatetimeControl.$(container).appendChild(_calTable);
        }

        /**
         * set date and refresh calendar to display the date
         * @param Date date - date object of a date
         */
        function setDate(date){
            if (!date) date = ActionStep_DatetimeControl.DateUtils.TODAY;
            _displayDate = new Date(date);
            _selectedDate = new Date(date);
            _renderBody();
        }

        /**
         * set callback functions for click on calendar days
         * @param object callback - in format {func: customFunc, param: functionParameters}
         */
        function setCallback(callback){
            _callback = callback;
        }

        /**
         * @return HtmlElement - table element, container for the whole calendar
         */
        function getHtmlElement(){
            return _calTable;
        }

        function attachCustomEvent(eventName, method, context) {
            if (!_eventCallbacks[eventName]) {
                _eventCallbacks[eventName] = [];
            }
            _eventCallbacks[eventName].push({
                'method' : method,
                'context' : context
            });
        }

        // link public mothods
        return {
            setContainer: setContainer,
            setDate: setDate,
            setCallback: setCallback,
            getHtmlElement: getHtmlElement,
            attachCustomEvent: attachCustomEvent
        }
    },

    MemoControl: function (input){
        var _hiddenInputBox, _memoInputBox;

        (function _construct(){
            _hiddenInputBox = ActionStep_DatetimeControl.$(input);
            _setMemoInputBox();

            _hiddenInputBox.style.display = "none";
            _memoInputBox.disabled = _hiddenInputBox.disabled;

            _hiddenInputBox.parentNode.insertBefore(_memoInputBox, _hiddenInputBox);
        })();

        /**
         * initialise date text box
         */
        function _setMemoInputBox(){
            _memoInputBox = ActionStep_DatetimeControl.$$('input', {type: 'text', className: 'DateControl_MemoInputBox'});
            if (_hiddenInputBox.id) _memoInputBox.id = 'DateControl_' + _hiddenInputBox.id;
            if (_hiddenInputBox.value != '') {
                _memoInputBox.value = ActionStep_Locale.formatDateInEntryFormat(_hiddenInputBox.value);
                _memoInputBox.title = ActionStep_Locale.formatDateInLongFormat(_hiddenInputBox.value);
            }

            _memoInputBox.onblur = function(){
                _setFinalInputOutputMemo();
            }

            _memoInputBox.onkeyup = function(e){
                if (!e) var e = window.event;
                if (e.keyCode == 13){
                    _setFinalInputOutputMemo();
                }
            }

            // transfer style to _dateInputBox
            _memoInputBox.setAttribute('style', _hiddenInputBox.getAttribute('style'));
        }

        /**
         * the single / ONLY portal for setting final date value for hidden input and display input
         * @param Date date - if this value is not set, value will be obtained from _dateInputBox.value. Also is default param from calendar object
         */
        function _setFinalInputOutputMemo(memo){
            if (memo == null) memo = _memoInputBox.value;

            _hiddenInputBox.oldValue = _hiddenInputBox.value;
            _hiddenInputBox.value = memo;

            if (memo == '') {
                _memoInputBox.value = '';
                _memoInputBox.title = '';
            } else {
                _memoInputBox.value = _hiddenInputBox.value;
                _memoInputBox.title = _hiddenInputBox.value;
            }

            if (_hiddenInputBox.oldValue != _hiddenInputBox.value) ActionStep_DatetimeControl.Utils.fireEvent(_hiddenInputBox, 'change');
        }

        return {
            /**
             * Set new memo value
             * @param string memo
             */
            setMemo: function(memo){
                _setFinalInputOutputMemo(memo);
            },
            getMemo: function() {
                return _hiddenInputBox.value;
            }
        }
    },

    DateControl: function (input){
        // private vars
        var _calendar = new ActionStep_DatetimeControl.Calendar();
        var _calendarDiv = ActionStep_DatetimeControl.$$('div', {className: 'DateControl_CalDiv'});
        var _calIcon = ActionStep_DatetimeControl.$$('img', {className: 'DateControl_CalIcon', src: 'https://assets.nationbuilder.com/mwc/pages/947/attachments/original/1692844522/ActionStep_DatetimeControl_Cal.png', alt: 'calendar', onclick: _showCalDiv});
        var _hiddenInputBox, _dateInputBox;

        (function _construct(){
            _hiddenInputBox = ActionStep_DatetimeControl.$(input);
            _setDateInputBox();

            _calendar.setCallback({func: _selectDate});
            _calendar.setContainer(_calendarDiv);

            var clearButton = ActionStep_DatetimeControl.$$('div', {className: 'DateControl_ClearButton', innerHTML: 'CLEAR DATE', id: 'DateControl_ClearButton'});
            clearButton.onclick = function(){
                _dateInputBox.value = '';
                _setFinalInputOutputDate();
                _calendar.hide();
                _dateInputBox.focus();
            };
            _calendarDiv.appendChild(clearButton);

            _hiddenInputBox.style.display = "none";
            _dateInputBox.disabled = _hiddenInputBox.disabled;
            // insert order is important

            if (! _hiddenInputBox.disabled) {
                _hiddenInputBox.parentNode.insertBefore(_calendarDiv, _hiddenInputBox);
            }

            _hiddenInputBox.parentNode.insertBefore(_dateInputBox, _hiddenInputBox);

            if (! _hiddenInputBox.disabled) {
                _hiddenInputBox.parentNode.insertBefore(_calIcon, _hiddenInputBox);
            }

            ActionStep_DatetimeControl.Utils.addEvent(document, 'click', _hideCalDiv);
        })();

        /**
         * initialise date text box
         */
        function _setDateInputBox(){

            // set attributes for new field
            let attributes = {type: 'text', className: 'DateControl_DateInputBox'}

            // check if hidden field is required then add required to attributes and remove required off hidden field
            if(_hiddenInputBox.getAttribute('required')) {
                _hiddenInputBox.removeAttribute('required');
                attributes = {type: 'text', className: 'DateControl_DateInputBox', required: 'required'}
            }

            // add attributes to new date field
            _dateInputBox = ActionStep_DatetimeControl.$$('input', attributes);
            if (_hiddenInputBox.id) _dateInputBox.id = 'DateControl_' + _hiddenInputBox.id;
            if (_hiddenInputBox.value != '') {
                _dateInputBox.value = ActionStep_Locale.formatDateInEntryFormat(_hiddenInputBox.value);
                _dateInputBox.title = ActionStep_Locale.formatDateInLongFormat(_hiddenInputBox.value);
            }

            _dateInputBox.onclick = _showCalDiv;

            _dateInputBox.onblur = function(){
                _setFinalInputOutputDate();
            }

            _dateInputBox.onkeyup = function(e){
                if (!e) var e = window.event;
                if (e.keyCode == 13){
                    _setFinalInputOutputDate();
                    _calendar.hide();
                } else if (e.keyCode == 9){ // tab into input (onfocus from keyboard tab only)
                    _showCalDiv({clientY: 0}); // clientY here just to fake mouse clicking on _dateInputBox at upper part of the screen
                }
            }

            _dateInputBox.onkeydown = function(e){ // tabbing out (onblur from keyboard tab only)
                if (!e) var e = window.event;
                if (e.keyCode == 9) _calendar.hide();
            }
            // transfer style to _dateInputBox
            _dateInputBox.setAttribute('style', _hiddenInputBox.getAttribute('style'));
        }

        /**
         * the single / ONLY portal for setting final date value for hidden input and display input
         * @param Date date - if this value is not set, value will be obtained from _dateInputBox.value. Also is default param from calendar object
         */
        function _setFinalInputOutputDate(date){
            if (date == null) date = ActionStep_DatetimeControl.DateUtils.parseDate(_dateInputBox.value);

            _hiddenInputBox.oldValue = _hiddenInputBox.value;
            _hiddenInputBox.value = ActionStep_DatetimeControl.DateUtils.getDateString(date, ActionStep_DatetimeControl.DateUtils.DATE_STRING_DB);

            if (date == '') {
                _dateInputBox.value = '';
                _dateInputBox.title = '';
            } else {
                // echo([date, _hiddenInputBox.value, ActionStep_Locale.formatDateInEntryFormat(_hiddenInputBox.value), ActionStep_Locale._dateFormatEntry]);
                _dateInputBox.value = ActionStep_Locale.formatDateInEntryFormat(_hiddenInputBox.value);
                _dateInputBox.title = ActionStep_Locale.formatDateInLongFormat(_hiddenInputBox.value);
            }

            if (_hiddenInputBox.oldValue != _hiddenInputBox.value) ActionStep_DatetimeControl.Utils.fireEvent(_hiddenInputBox, 'change');
        }

        /**
         * callback function for calendar for onclick on dates
         * @param Date date - date selected, default param from calendar object
         */
        function _selectDate(date){
            _setFinalInputOutputDate(date);
            _dateInputBox.focus();
            _calendar.hide();
        }

        /**
         * display calendar and put it in right position
         * also is callback function for clicking on date input box or calendar icon
         */
        function _showCalDiv(e){
            _calendar.setDate(ActionStep_DatetimeControl.DateUtils.parseDate(_dateInputBox.value));
            _calendar.show();
            if (!e) var e = window.event;
            _calendarDiv.style.marginTop = (e.clientY > document.documentElement.clientHeight / 2) ? -1 - _calendarDiv.offsetHeight + 'px' : '24px';
            _dateInputBox.focus();
            try {
                // bug fix for classic list positioning.
                if ((typeof(jQuery) !== 'undefined') && (typeof(ActionStep_ClassicList) !== 'undefined')) {
                    if (jQuery(_dateInputBox).closest("#full_filter_form").length > 0) {
                        var height = jQuery(_dateInputBox).offset().top - jQuery(".FilterFormContainer").offset().top;
                        if (height < 185) {
                            jQuery(".DateControl_CalDiv").css({'bottom' : -174});
                        } else {
                            jQuery(".DateControl_CalDiv").css({'bottom' : 32});
                        }
                    }
                }
            } catch (e) {
                // ignored.
            }

        }

        /**
         * callback function for global document onclick, hide calendar when clicking outside calendar control
         */
        function _hideCalDiv(e){
            if (!e) var e = window.event;
            var target = e.target ? e.target : e.srcElement;

            while(target.parentNode){
                if (target == _calendarDiv || target == _dateInputBox || target == _calIcon) return;
                target = target.parentNode;
            }
            _calendar.hide();
        }

        // add show calendar function to calendar object.
        _calendar.show = function(){
            _calendarDiv.style.display = 'inline';
        }

        // add hide calendar function
        _calendar.hide = function(){
            _calendarDiv.style.display = 'none';
        }

        return {
            /**
             * Set new date value
             * @param string date - date string e.g. 2009-01-01
             */
            setDate: function(date){
                _setFinalInputOutputDate(ActionStep_DatetimeControl.DateUtils.parseDate(date));
            },
            getDate: function() {
                return ActionStep_Locale.formatDateInEntryFormat(_hiddenInputBox.value);
            }
        }
    },

    TimeControl: function(input){
        var _hiddenInputBox, _timeInputBox, _timeDropdownBox;
        var _manualEntry = true; // indicates if user typed in time manually for enter key (use value from dropdown box or use typed in value)
        var _focusedTimeOption; // DivHtmlElement - currently focused / highlighted option from time drop down selection box

        (function _construct(){
            _hiddenInputBox = ActionStep_DatetimeControl.$(input);
            _setTimeInputBox();
            _setTimeDropdownBox();

            _hiddenInputBox.style.display = "none";
            _hiddenInputBox.parentNode.insertBefore(_timeDropdownBox, _hiddenInputBox);
            _hiddenInputBox.parentNode.insertBefore(_timeInputBox, _hiddenInputBox);

            ActionStep_DatetimeControl.Utils.addEvent(document, 'click', _hideTimeDropdownBox);
        })();

        /**
         * create input box for time entry
         */
        function _setTimeInputBox(){
            _timeInputBox = ActionStep_DatetimeControl.$$('input', {type: 'text', maxLength: 7, className: 'TimeControl_TimeInputBox'});
            if (_hiddenInputBox.id) _timeInputBox.id = 'TimeControl_' + _hiddenInputBox.id;

            _timeInputBox.value = ActionStep_DatetimeControl.DateUtils.getTimeString(ActionStep_DatetimeControl.DateUtils.parseTime(_hiddenInputBox.value), ActionStep_DatetimeControl.DateUtils.TIME_STRING_12HR);

            // transfer style to _timeInputBox
            _timeInputBox.setAttribute('style', _hiddenInputBox.getAttribute('style'));
            _timeInputBox.tabIndex = _hiddenInputBox.tabIndex;
            // _hiddenInputBox.tabIndex = null;
            _timeInputBox.disabled = _hiddenInputBox.disabled;

            _timeInputBox.onclick = _showTimeDropdownBox;

            _timeInputBox.onblur = function(){
                _setFinalInputOutputTime(ActionStep_DatetimeControl.DateUtils.parseTime(this.value));
            }

            _timeInputBox.onkeydown = function(e){
                if (!e) var e = window.event;
                switch(e.keyCode){
                    case 9: // tab out (onblur from keyboard tab only)
                        _hideTimeDropdownBox({target: null});
                        break;
                    case 38: // up
                        _showTimeDropdownBox({clientY: 0});
                        // focus previous option if exists otherwise jump to last option
                        _setTimeOptionFocus(_focusedTimeOption.previousSibling ? _focusedTimeOption.previousSibling : _timeDropdownBox.lastChild);
                        break;
                    case 40: // down
                        _showTimeDropdownBox({clientY: 0});
                        // focus next option if exists otherwise jump to first option
                        _setTimeOptionFocus(_focusedTimeOption.nextSibling ? _focusedTimeOption.nextSibling : _timeDropdownBox.firstChild);
                        break;
                }
            }

            _timeInputBox.onkeyup = function(e){
                if (!e) var e = window.event;
                switch(e.keyCode){
                    case 13: // press enter
                        var time = _manualEntry ? ActionStep_DatetimeControl.DateUtils.parseTime(_timeInputBox.value, true) : _focusedTimeOption.time;
                        _setFinalInputOutputTime(time);
                        _hideTimeDropdownBox({target: null});
                        break;
                    case 9: // tab into input (onfocus from keyboard tab only)
                        _showTimeDropdownBox({clientY: 0}); // clientY here just to fake mouse clicking on _timeInputBox at upper part of the screen
                        break;
                    case 38: case 40:
                        _manualEntry = false;
                        break;
                    default:
                        _hideTimeDropdownBox({target: null});
                        _manualEntry = true;
                        break;
                }
            }
        }

        /**
         * create dropdown box for time selection
         */
        function _setTimeDropdownBox(){
            var nowButton = ActionStep_DatetimeControl.$$('div', {className: 'TimeControl_NowButton', innerHTML: 'Now', title: 'set time to current time'});
            nowButton.onclick = function(){
                _setFinalInputOutputTime(new Date());
            }

            var timeOptions = ActionStep_DatetimeControl.$$('p', {className: 'TimeControl_TimeOptions'});
            for (var i=0; i<48; i++) { // 24 hours + 24 half hours
                var timeString = (i == 24 || i == 25) ? '12' : Math.floor(i / 2) % 12;
                timeString +=  (i%2 == 0) ? ':00' : ':30';
                timeString += (i < 24) ? 'am' : 'pm';

                var option = ActionStep_DatetimeControl.$$('div', {innerHTML: timeString, time: ActionStep_DatetimeControl.DateUtils.parseTime(timeString)});
                option.onclick = function(){
                    _setFinalInputOutputTime(this.time);
                    _timeInputBox.focus();
                };
                // _timeDropdownBox.appendChild(option);
                timeOptions.appendChild(option);
            }

            _timeDropdownBox = ActionStep_DatetimeControl.$$('div', {className: 'TimeControl_Dropdown', id: 'TimeControl_Dropdown'});
            _timeDropdownBox.appendChild(nowButton);
            _timeDropdownBox.appendChild(timeOptions);
        }

        /**
         * the single / ONLY portal for setting final time value for hidden input and display input
         * @param Date time
         */
        function _setFinalInputOutputTime(time){
            _timeInputBox.value = ActionStep_DatetimeControl.DateUtils.getTimeString(time, ActionStep_DatetimeControl.DateUtils.TIME_STRING_12HR);
            _hiddenInputBox.oldValue = _hiddenInputBox.value;
            _hiddenInputBox.value = ActionStep_DatetimeControl.DateUtils.getTimeString(time, ActionStep_DatetimeControl.DateUtils.TIME_STRING_24HR);
            _manualEntry = true;
            if (_hiddenInputBox.oldValue != _hiddenInputBox.value) ActionStep_DatetimeControl.Utils.fireEvent(_hiddenInputBox, 'change');
        }

        /**
         * Display calendar drop down options and put it in right position, also focus / scroll to the time option based on the value in _hiddenInputBox
         */
        function _showTimeDropdownBox(e){
            if (_timeDropdownBox.style.display == 'inline') return;

            if (!e) var e = window.event;
            _timeDropdownBox.className = (e.clientY > document.documentElement.clientHeight / 2) ? 'TimeControl_Dropdown TimeControl_DropdownTop' : 'TimeControl_Dropdown';
            _timeDropdownBox.style.display = 'inline';

            var selectedTime = isEmpty(_hiddenInputBox.value) ? ActionStep_DatetimeControl.DateUtils.TODAY : ActionStep_DatetimeControl.DateUtils.parseTime(_hiddenInputBox.value);
            var options = _timeDropdownBox.getElementsByTagName('div');
            for (var i=0; i<options.length; i++){
                // is last option && option time < selected (23:30 - 23:59) || this option <= selected && next option > selected
                if (options[i+1] == null && options[i].time <= selectedTime || options[i].time <= selectedTime && options[i+1].time > selectedTime){
                    _setTimeOptionFocus(options[i]);
                }
            }
        }

        /**
         * Highlight / focus selected option in time drop down box
         * @param DivHtmlElement optionToFocus - div element of the option
         */
        function _setTimeOptionFocus(optionToFocus){
            if (_focusedTimeOption) _focusedTimeOption.className = null; // remove highlight from previously focused option
            optionToFocus.className = 'TimeControl_Selected';
            // _timeDropdownBox.scrollTop = optionToFocus.offsetTop - 60;
            _timeDropdownBox.lastChild.scrollTop = optionToFocus.offsetTop - 60;
            _focusedTimeOption = optionToFocus;
        }

        /**
         * hide time drop down box and also is the callback function for document click event
         */
        function _hideTimeDropdownBox(e){
            if (!e) var e = window.event;
            var target = e.target ? e.target : e.srcElement;
            if (target != _timeInputBox) {
                _timeDropdownBox.style.display = 'none';
            }
        }

        return {
            /**
             * Set new time value
             * @param string time - time string e.g. 12:00pm
             */
            setTime: function(time){
                _setFinalInputOutputTime(ActionStep_DatetimeControl.DateUtils.parseTime(time));
            }
        }
    },

    DatetimeControl: function(input){
        var _hiddenInputBox, _dateInputBox, _timeInputBox;
        var _dateControl, _timeControl;

        (function _construct(){
            _hiddenInputBox = ActionStep_DatetimeControl.$(input);
            _dateInputBox = ActionStep_DatetimeControl.$$('input', {type: 'text', onchange: _setFinalInputOutputDateTime});
            _timeInputBox = ActionStep_DatetimeControl.$$('input', {type: 'text', onchange: _setFinalInputOutputDateTime});

            if (_hiddenInputBox.id) {
                _dateInputBox.id = _hiddenInputBox.id + '_date';
                _timeInputBox.id = _hiddenInputBox.id + '_time';
            }

            // transfer style
            _dateInputBox.setAttribute('style', _hiddenInputBox.getAttribute('style'));
            _timeInputBox.setAttribute('style', _hiddenInputBox.getAttribute('style'));

            _hiddenInputBox.style.display = "none";
            _hiddenInputBox.onchange = _setInitialInputOutputDateTime;

            _dateInputBox.disabled = _hiddenInputBox.disabled;
            _timeInputBox.disabled = _hiddenInputBox.disabled;
            // insert order is important


            _hiddenInputBox.parentNode.insertBefore(_dateInputBox, _hiddenInputBox);
            _hiddenInputBox.parentNode.insertBefore(document.createTextNode(' '), _hiddenInputBox); // space between date and time
            _hiddenInputBox.parentNode.insertBefore(_timeInputBox, _hiddenInputBox);

            var dateTime = _hiddenInputBox.value.split(" ");
            if (dateTime[0]) _dateInputBox.value = dateTime[0];
            if (dateTime[1]) _timeInputBox.value = dateTime[1];

            _dateControl = new ActionStep_DatetimeControl.DateControl(_dateInputBox);
            _timeControl = new ActionStep_DatetimeControl.TimeControl(_timeInputBox);
        })();

        function _setFinalInputOutputDateTime(){
            _hiddenInputBox.oldValue = _hiddenInputBox.value;
            _hiddenInputBox.value = _dateInputBox.value + ' ' + _timeInputBox.value;
            if (_hiddenInputBox.oldValue != _hiddenInputBox.value) ActionStep_DatetimeControl.Utils.fireEvent(_hiddenInputBox, 'change');
        }

        function _setInitialInputOutputDateTime() {
            var dateTime = _hiddenInputBox.value.split(" ");
            if (dateTime[0]) _dateInputBox.value = dateTime[0];
            if (dateTime[1]) _timeInputBox.value = dateTime[1];

            _dateControl.setDate(dateTime[0]);
            _timeControl.setTime(dateTime[1]);
            _setFinalInputOutputDateTime();
        }

        return {
            /**
             * Set new datetime value
             * @param string datetime - datetime string e.g. 2009-01-01 09:10:00
             */
            setDatetime: function(datetime){
                var dateParts = datetime.split(" ");
                if (!dateParts[1]) dateParts[1] = '';
                _dateControl.setDate(dateParts[0]);
                _timeControl.setTime(dateParts[1]);
                _setFinalInputOutputDateTime();
            }
        }
    },

    DatetimeMemoControl: function(input){
        var _hiddenInputBox, _dateInputBox, _timeInputBox, _memoInputBox;
        var _dateControl, _timeControl, _memoControl;

        (function _construct(){
            _hiddenInputBox = ActionStep_DatetimeControl.$(input);
            _dateInputBox = ActionStep_DatetimeControl.$$('input', {type: 'text', onchange: _setFinalInputOutputDateTimeMemo});
            _timeInputBox = ActionStep_DatetimeControl.$$('input', {type: 'text', onchange: _setFinalInputOutputDateTimeMemo});
            _memoInputBox = ActionStep_DatetimeControl.$$('input', {type: 'text', onchange: _setFinalInputOutputDateTimeMemo});

            if (_hiddenInputBox.id) {
                _dateInputBox.id = _hiddenInputBox.id + '_date';
                _timeInputBox.id = _hiddenInputBox.id + '_time';
                _memoInputBox.id = _hiddenInputBox.id + '_memo';
            }

            // transfer style
            _dateInputBox.setAttribute('style', _hiddenInputBox.getAttribute('style'));
            _timeInputBox.setAttribute('style', _hiddenInputBox.getAttribute('style'));
            _memoInputBox.setAttribute('style', _hiddenInputBox.getAttribute('style'));

            _hiddenInputBox.style.display = "none";
            _hiddenInputBox.onchange = _setInitialInputOutputDateTimeMemo;

            _hiddenInputBox.parentNode.insertBefore(_dateInputBox, _hiddenInputBox);
            _hiddenInputBox.parentNode.insertBefore(document.createTextNode(' '), _hiddenInputBox); // space between date and time
            _hiddenInputBox.parentNode.insertBefore(_timeInputBox, _hiddenInputBox);
            _hiddenInputBox.parentNode.insertBefore(document.createTextNode(' '), _hiddenInputBox); // space between time and memo
            _hiddenInputBox.parentNode.insertBefore(_memoInputBox, _hiddenInputBox);

            var datetimeMemo = _hiddenInputBox.value.split('|description=');
            var datetime     = datetimeMemo[0].split(' ')

            if (datetime[0]) _dateInputBox.value = datetime[0];
            if (datetime[1]) _timeInputBox.value = datetime[1];
            if (datetimeMemo[1]) _memoInputBox.value = datetimeMemo[1];

            _dateControl = new ActionStep_DatetimeControl.DateControl(_dateInputBox);
            _timeControl = new ActionStep_DatetimeControl.TimeControl(_timeInputBox);
            _memoControl = new ActionStep_DatetimeControl.MemoControl(_memoInputBox);

        })();

        function _setFinalInputOutputDateTimeMemo() {
            _hiddenInputBox.oldValue = _hiddenInputBox.value;
            _hiddenInputBox.value = _dateInputBox.value + ' ' + _timeInputBox.value + '|description=' + _memoInputBox.value;
            if (_hiddenInputBox.oldValue != _hiddenInputBox.value) ActionStep_DatetimeControl.Utils.fireEvent(_hiddenInputBox, 'change');
        }

        function _setInitialInputOutputDateTimeMemo() {
            var datetimeMemo = _hiddenInputBox.value.split('|description=');
            var datetime     = datetimeMemo[0].split(' ')

            if (datetime[0])     _dateInputBox.value = datetime[0];
            if (datetime[1])     _timeInputBox.value = datetime[1];
            if (datetimeMemo[1]) _memoInputBox.value = datetimeMemo[1];

            _dateControl.setDate(datetime[0]);
            _timeControl.setTime(datetime[1]);
            _memoControl.setMemo(datetimeMemo[1]);
            _setFinalInputOutputDateTimeMemo();
        }

        return {
            /**
             * Set new datetime value
             * @param string datetime - datetime string e.g. 2009-01-01 09:10:00
             */
            setDatetime: function(datetimeMemo){
                var datetimeMemoParts = datetimeMemo.split('|description=');
                var datetimeParts     = datetimeMemoParts[0].split(' ');

                //if (!datetimeMemoParts[1]) datetimeMemoParts[1] = '';
                if (!datetimeParts[0]) datetimeParts[0] = '';
                if (!datetimeParts[1]) datetimeParts[1] = '';

                _dateControl.setDate(datetimeParts[0]);
                _timeControl.setTime(datetimeParts[1]);
                _memoControl.setMemo(datetimeMemoParts[1]);
                _setFinalInputOutputDateTimeMemo();
            }
        }
    },

    DateMemoControl: function(input){
        var _hiddenInputBox, _dateInputBox, _memoInputBox, _dateControl, _memoControl;

        (function _construct(){
            _hiddenInputBox = ActionStep_DatetimeControl.$(input);
            _dateInputBox = ActionStep_DatetimeControl.$$('input', {type: 'text', onchange: _setFinalInputOutputDateMemo});
            _memoInputBox = ActionStep_DatetimeControl.$$('input', {type: 'text', onchange: _setFinalInputOutputDateMemo});

            if (_hiddenInputBox.id) {
                _dateInputBox.id = _hiddenInputBox.id + '_date';
                _memoInputBox.id = _hiddenInputBox.id + '_memo';
            }

            // transfer style
            _dateInputBox.setAttribute('style', _hiddenInputBox.getAttribute('style'));
            _memoInputBox.setAttribute('style', _hiddenInputBox.getAttribute('style'));

            _hiddenInputBox.style.display = "none";
            _hiddenInputBox.onchange = _setInitialInputOutputDateMemo;

            _hiddenInputBox.parentNode.insertBefore(_dateInputBox, _hiddenInputBox);
            _hiddenInputBox.parentNode.insertBefore(document.createTextNode(' '), _hiddenInputBox); // space between date and time
            _hiddenInputBox.parentNode.insertBefore(_memoInputBox, _hiddenInputBox);

            var dateMemo = _hiddenInputBox.value.split('|description=');
            var datetime = dateMemo[0].split(' '); // To strip out time fields if they still exist

            if (datetime[0]) _dateInputBox.value = datetime[0];
            if (dateMemo[1]) _memoInputBox.value = dateMemo[1];

            _dateControl = new ActionStep_DatetimeControl.DateControl(_dateInputBox);
            _memoControl = new ActionStep_DatetimeControl.MemoControl(_memoInputBox);
        })();

        function _setFinalInputOutputDateMemo(){
            _hiddenInputBox.oldValue = _hiddenInputBox.value;
            _hiddenInputBox.value = _dateInputBox.value + '|description=' + _memoInputBox.value;
            if (_hiddenInputBox.oldValue != _hiddenInputBox.value) ActionStep_DatetimeControl.Utils.fireEvent(_hiddenInputBox, 'change');
        }

        function _setInitialInputOutputDateMemo() {
            var dateMemo = _hiddenInputBox.value.split('|description=');
            var datetime = dateMemo[0].split(' ')

            if (datetime[0])     _dateInputBox.value = datetime[0];
            if (dateMemo[1]) _memoInputBox.value = dateMemo[1];

            _dateControl.setDate(datetime[0]);
            _memoControl.setMemo(dateMemo[1]);
            _setFinalInputOutputDateMemo();
        }

        return {
            /**
             * Set new datetime value
             * @param string datetime - datetime string e.g. 2009-01-01 09:10:00
             */
            setDateMemo: function(dateMemo) {
                var dateParts = dateMemo.split('|description=');
                if (!dateParts[0]) dateParts[0] = '';

                var datetimeParts = dateParts[0].split(' ');
                // If there is a time component strip out

                _dateControl.setDate(datetimeParts[0]);
                _memoControl.setMemo(dateParts[1]);
                _setFinalInputOutputDateMemo();
            }
        }
    },

    /**
     * @param string tagName
     * @param json attribs - extra property e.g. {className: 'class', id: 'elemID'}
     */
    $$: function(tagName, attribs){
        var htmlElement = document.createElement(tagName);
        if (attribs){
            for (var property in attribs){
                htmlElement[property] = attribs[property];
            }
        }
        return htmlElement;
    },

    // shortcut functions
    /**
     * @param string|HtmlElement obj
     */
    $: function(obj){
        return (typeof(obj) == 'string') ? document.getElementById(obj) : obj;
    }
}

ActionStep_DatetimeControl.Utils.addEvent(window, 'load', ActionStep_DatetimeControl.autoInit);

if (typeof(ActionStep_Utilities_LazyLoader) !== 'undefined') {
    window.setTimeout(ActionStep_DatetimeControl.autoInit, 100);
    window.setTimeout(ActionStep_DatetimeControl.autoInit, 1000);
}

/**
 * similar to empty() in PHP, check if a string is an empty string
 * @return bool
 String.prototype.AS_DC_isEmpty = function(){
    return (this.replace(/^\s+|\s+$/g, '') == '');
}
 */


function isEmpty(obj) {
    if (typeof(obj) == 'undefined') {
        return true;
    }
    return (obj.toString().replace(/^\s+|\s+$/g, '') == '');
}