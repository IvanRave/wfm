define(['jquery'], function ($) {
    'use strict';

    var appHelper = {};

    // Hidden Iframe for file loading (to the client comp)
    appHelper.downloadURL = function (url) {
        var hiddenIFrameID = 'hiddenDownloader',
            iframe = document.getElementById(hiddenIFrameID);
        if (iframe === null) {
            iframe = document.createElement('iframe');
            iframe.id = hiddenIFrameID;
            iframe.style.display = 'none';
            document.body.appendChild(iframe);
        }

        iframe.src = url;
    };

    appHelper.endsWith = function (str, suffix) {
        return str.indexOf(suffix, str.length - suffix.length) !== -1;
    };

    appHelper.startsWith = function (str, suffix) {
        return str.indexOf(suffix) === 0;
    };

    // result example: 12,32 43,12 43,54
    appHelper.twoDimArrayToString = function (twoDimArray) {
        for (var i = 0, iMax = twoDimArray.length; i < iMax; i++) {
            if (twoDimArray[i] instanceof Array) {
                twoDimArray[i] = twoDimArray[i].join(',');
            }
        }

        return twoDimArray.join(' ');
    };

    // result example [[12,32] [42,12] [43,54]]
    appHelper.stringToTwoDimArray = function (stringArray) {
        var oneDimArray = stringArray.split(' ');
        // result = ["12.3,324", "1234,53.45"]
        var twoDimArray = [];
        for (var i = 0, iMax = oneDimArray.length; i < iMax; i++) {
            var tempArr = oneDimArray[i].split(',');
            // result = ["1234", "234.3"]

            tempArr = $.map(tempArr, function (elemValue) {
                return parseFloat(elemValue);
            });

            twoDimArray.push(tempArr);
        }

        return twoDimArray;
    };

    // get area in square units
    appHelper.getArea = function (arr) {
        var arrLength = arr.length;
        if (arrLength < 3) return 0;
        // set overlast element
        arr.push([arr[0][0], arr[0][1]]);

        var area = 0;
        for (var i = 0; i < arrLength; i += 1) {
            area = area + (arr[i][0] * arr[i + 1][1] - arr[i][1] * arr[i + 1][0]);
        }

        return Math.abs(area / 2);
    };

    appHelper.toggleLoadingState = function (isOn) {
        var $spinner = $('.spinner');
        if (isOn) {
            if ($spinner.is(':visible') === false) {
                $spinner.show();
            }
        }
        else {
            if ($spinner.is(':visible') === true) {
                $spinner.hide();
            }
        }
    };

    appHelper.getYearList = function (startYear, endYear) {
        var tempArr = [],
            i = startYear;

        for (i; i <= endYear; i += 1) {
            tempArr.unshift(i);
        }

        return tempArr;
    };

    return appHelper;
});