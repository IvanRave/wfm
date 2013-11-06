define(['app/app-helper'], function (appHelper) {
    'use strict';

    var cookieHelper = {};

    cookieHelper.getCookies = function () {
        var c = document.cookie, v = 0, cookies = {};
        if (document.cookie.match(/^\s*\$Version=(?:"1"|1);\s*(.*)/)) {
            c = RegExp.$1;
            v = 1;
        }
        if (v === 0) {
            c.split(/[,;]/).map(function (cookie) {
                var parts = cookie.split(/=/, 2),
                    name = decodeURIComponent(appHelper.trimLeft(parts[0])),
                    value = parts.length > 1 ? decodeURIComponent(appHelper.trimRight(parts[1])) : null;
                cookies[name] = value;
            });
        } else {
            c.match(/(?:^|\s+)([!#$%&'*+\-.0-9A-Z^`a-z|~]+)=([!#$%&'*+\-.0-9A-Z^`a-z|~]*|"(?:[\x20-\x7E\x80\xFF]|\\[\x00-\x7F])*")(?=\s*[,;]|$)/g).map(function ($0, $1) {
                var name = $0,
                    value = $1.charAt(0) === '"' ? $1.substr(1, -1).replace(/\\(.)/g, "$1") : $1;
                cookies[name] = value;
            });
        }
        return cookies;
    };

    cookieHelper.getCookie = function (cookieName) {
        return cookieHelper.getCookies()[cookieName];
    };

    cookieHelper.createCookie = function (name, value, days) {
        var expires = '';
        if (days) {
            var date = new Date();
            date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
            expires = '; expires=' + date.toGMTString();
        }

        document.cookie = name + '=' + value + expires + '; path=/';
    };

    cookieHelper.removeCookie = function (name) {
        document.cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:01 GMT; path=/';
    };

    return cookieHelper;
});