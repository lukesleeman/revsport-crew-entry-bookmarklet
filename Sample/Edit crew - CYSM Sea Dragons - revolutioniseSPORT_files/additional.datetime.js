// Extending the additional methods

jQuery.validator.addMethod(
    "date-pick",
    function(value, element) {
        var check = false;
        var re = /^\d{1,2}\/\d{1,2}\/\d{4}$/;
        var reAlternate = /^\d{4}-\d{1,2}-\d{1,2}$/;
        if (re.test(value)) {
            var adata = value.split('/');
            var dd = parseInt(adata[0],10);
            var mm = parseInt(adata[1],10);
            var yyyy = parseInt(adata[2],10);
            var xdata = new Date(yyyy,mm-1,dd);
            check = (xdata.getFullYear() == yyyy) && (xdata.getMonth () == mm - 1) && (xdata.getDate() == dd);
        } else if  ( reAlternate.test(value)) {
            var adata = value.split('-');
            var yyyy = parseInt(adata[0],10);
            var mm = parseInt(adata[1],10);
            var dd = parseInt(adata[2],10);
            var xdata = new Date(yyyy,mm-1,dd);
            check = (xdata.getFullYear() == yyyy) && (xdata.getMonth () == mm - 1) && (xdata.getDate() == dd);
        } else {
            check = false;
        }
        return this.optional(element) || check;
    },
    'Please enter a valid date in the format dd/mm/yyyy.'
);

jQuery.validator.addMethod(
    "date-pick-new",
    function(value, element) {
        var check = false;
        var re = /^\d{1,2}\/\d{1,2}\/\d{4}$/;
        var reAlternate = /^\d{4}-\d{1,2}-\d{1,2}$/;
        if (re.test(value)) {
            var adata = value.split('/');
            var dd = parseInt(adata[0],10);
            var mm = parseInt(adata[1],10);
            var yyyy = parseInt(adata[2],10);
            var xdata = new Date(yyyy,mm-1,dd);
            check = (xdata.getFullYear() == yyyy) && (xdata.getMonth () == mm - 1) && (xdata.getDate() == dd);
        } else if (reAlternate.test(value)) {
            var adata = value.split('-');
            var yyyy = parseInt(adata[0],10);
            var mm = parseInt(adata[1],10);
            var dd = parseInt(adata[2],10);
            var xdata = new Date(yyyy,mm-1,dd);
            check = (xdata.getFullYear() == yyyy) && (xdata.getMonth () == mm - 1) && (xdata.getDate() == dd);
        } else {
            check = false;
        }
        return this.optional(element) || check;
    },
    'Please enter a valid date in the format dd/mm/yyyy.'
);

jQuery.validator.addMethod(
    "time-pick",
    function(value, element) {
        var check = false;
        var re = /^\d{2}:\d{2}$/;
        if (re.test(value)) {
            check = true;
            var parts = value.split(':');
            check = parts[0] <= 23 && parts[1] <= 59;
        } else {
            check = false;
        }
        return this.optional(element) || check;
    },
    'Please enter a valid 24 hour time in the format hh:mm.'
);

jQuery.validator.addMethod(
    "date-time-pick",
    function(value, element) {
        var checkDate = false;
        var checkTime = false;
        var reDate = /^\d{1,2}\/\d{1,2}\/\d{4}$/;
        var reDateAlternate = /^\d{4}-\d{1,2}-\d{1,2}$/;
        var reTime = /^\d{2}:\d{2}$/;
        var allsplit = value.split(' ');
        if (reDate.test(allsplit[0])) {
            var adata = allsplit[0].split('/');
            var dd = parseInt(adata[0],10);
            var mm = parseInt(adata[1],10);
            var yyyy = parseInt(adata[2],10);
            var xdata = new Date(yyyy,mm-1,dd);
            checkDate = (xdata.getFullYear() == yyyy) && (xdata.getMonth () == mm - 1) && (xdata.getDate() == dd);
        } else if (reDateAlternate.test(allsplit[0])) {
            var adata = allsplit[0].split('-');
            var yyyy = parseInt(adata[0],10);
            var mm = parseInt(adata[1],10);
            var dd = parseInt(adata[2],10);
            var xdata = new Date(yyyy,mm-1,dd);
            checkDate = (xdata.getFullYear() == yyyy) && (xdata.getMonth () == mm - 1) && (xdata.getDate() == dd);
        } else {
            checkDate = false;
        }

        if (reTime.test(allsplit[1])) {
            var parts = allsplit[1].split(':');
            checkTime = parts[0] <= 23 && parts[1] <= 59;
        } else {
            checkTime = false;
        }
        
        return this.optional(element) || (checkDate && checkTime);
    },
    'Please enter a valid timestamp in the format dd/mm/yyyy hh:mm.'
);

jQuery.validator.addMethod(
    "datetime-pick-range",
    function(value, element) {
        var hasEmptyFields = false;

        var setName = $(element).attr('data-range-set');
        var dateTimes = {};
        var allowEqualDateTimes = true;

        $("[data-range-set="+ setName +"]").each(function(v) {
            if ($(this).attr("data-range-set-allow-equals") === "false") {
                allowEqualDateTimes = false;
            }
            if ($(this).val().trim() === "") {
                hasEmptyFields = true;
            } else if ($(this).attr('data-dt-index') !== "") {
                if (parseInt($(this).attr('data-dt-index')) == $(this).attr('data-dt-index')) {
                    var dtIndex = parseInt($(this).attr('data-dt-index'));

                    if (typeof dateTimes[dtIndex] === "undefined") {
                        dateTimes[dtIndex] = new Date();
                    }

                    if ($(this).hasClass('time-pick') === true) {
                        var tsplit = $(this).val().split(':');
                        dateTimes[dtIndex].setHours(tsplit[0], tsplit[1]);
                    } else if ($(this).hasClass('date-pick') === true || $(this).hasClass('date-pick-new') === true) {
                        var dsplit = $(this).val().split('/');
                        dateTimes[dtIndex].setFullYear(dsplit[2], dsplit[1]-1, dsplit[0]);
                    } else if($(this).hasClass('date-time-pick') === true) {
                        var allsplit = $(this).val().split(' ');
                        var dsplit = allsplit[0].split('/');
                        var tsplit = allsplit[1].split(':');
                        dateTimes[dtIndex].setFullYear(dsplit[2], dsplit[1]-1, dsplit[0]);
                        dateTimes[dtIndex].setHours(tsplit[0], tsplit[1]);
                    }
                }
            }
        });

        var dtKeys = Object.keys(dateTimes);
        dtKeys.sort();

        if (hasEmptyFields || dtKeys.length < 2) {
            return true;
        }

        var allInOrder = true;

        for (var i = 0; i < (dtKeys.length - 1); i++) {
            if (allowEqualDateTimes === true) {
                allInOrder = allInOrder && (dateTimes[dtKeys[i]].getTime() <= dateTimes[dtKeys[i + 1]].getTime());
            } else {
                allInOrder = allInOrder && (dateTimes[dtKeys[i]].getTime() < dateTimes[dtKeys[i + 1]].getTime());
            }
        }

        return allInOrder;
    },
    function (params, element) {
        var setName = $(element).attr('data-range-set');
        var hasDate = false;
        var hasTime = false;
        var dateTimes = {};

        $("[data-range-set="+ setName +"]").each(function(v) {
            if ($(this).attr("data-time-start") === "true" || $(this).attr("data-time-end") === "true") {
                hasTime = true;
            } else if ($(this).attr("data-date-start") === "true" || $(this).attr("data-date-end") === "true") {
                hasDate = true;
            }
        });

        $("[data-range-set="+ setName +"]").each(function(v) {
            if ($(this).attr('data-dt-index') !== "") {
                if (parseInt($(this).attr('data-dt-index')) == $(this).attr('data-dt-index')) {
                    var dtIndex = parseInt($(this).attr('data-dt-index'));

                    if (typeof dateTimes[dtIndex] === "undefined") {
                        dateTimes[dtIndex] = true;
                    }

                    if ($(this).hasClass('time-pick') === true) {
                        hasTime = true;
                    } else if ($(this).hasClass('date-pick') === true) {
                        hasDate = true;
                    } else if ($(this).hasClass('date-time-pick') === true) {
                        hasDate = true;
                        hasTime = true;
                    }
                }
            }
        });

        if (Object.keys(dateTimes).length == 2) {
            if (hasDate === true && hasTime === true) {
                return "The start date/time must be before the end date/time.";
            } else if (hasDate === true) {
                return "The start date must be before the end date.";
            } else if (hasTime === true) {
                return "The start time must be before the end time.";
            }
        }

        return "Dates/times must be in chronological order.";
    }
);
