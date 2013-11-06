define([], function () {
    'use strict';

    var langDict = {
        // {{#each lang}}
        '{{lowercase @key}}': '{{this}}',
        // {{/each}}
    };

    ////var signArr = /,!/g; [',', '!', '.', ':', '?', '(', ')', '[', ']', '{', '}', '\'', ';'];
    ////var signRegExp = /[\.,-\/#!$%\^&\*;:{}=\-_`~()]/g;

    var langHelper = {};

    // Translate without punktuation signs
    langHelper.translate = function (str) {
        str = str.toLowerCase();
        var startSignIndex = str.search(/[\w]/g);
        var endSignIndex = str.search(/[^\w]+$/g);
        if (startSignIndex === -1) {
            startSignIndex = 0;
        }
        if (endSignIndex === -1) {
            endSignIndex = str.length;
        }
        var cleanStr = str.substring(startSignIndex, endSignIndex);
        var transStr = langDict[cleanStr];
        if (transStr) {
            return str.replace(cleanStr, transStr);
        }
        else {
            return str;
        }
    };

    // From: unknownParam: Email, Pass
    // To: unknown parameters: email, password
    // Only for ASCII strRow (no Unicode)
    langHelper.translateRow = function (strRow) {
        // TODO: translate entire row by space, colon etc.
        ////var rowArr = strRow.split(/[ ;:]/g);
        // Divide by whitespace
        var rowArr = strRow.split(' ');
        var destArr = [];
        // Translate every word without punktuation signs
        // If no translation then put origin word
        for (var i = 0; i < rowArr.length; i += 1) {
            destArr.push(langHelper.translate(rowArr[i]) || rowArr[i]);
        }

        // Join by space
        return destArr.join(' ');
    };

    return langHelper;

    ////var langHelper = {};

    ////// Get language id from cookie or url
    ////var langId = 'en';
    ////var dict;

    ////langHelper.translate = function (strId) {
    ////    if (dict) {
    ////        console.log('no dict');
    ////        return dict[strId] || strId;
    ////    }
    ////    else {
    ////        $.get('/data/lang/' + langId + '/lang.json', function (langDict) {
    ////            console.log('myData', langDict);
    ////            console.log('myDataStrId', langDict[strId]);
    ////            dict = langDict;
    ////            console.log(dict)
    ////            console.log('this is a dict');
    ////            return langDict[strId] || strId;
    ////        });
    ////    }
    ////};
});