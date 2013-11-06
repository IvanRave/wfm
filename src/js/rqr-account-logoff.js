require(['require-config'], function () {
    'use strict';

    // Show or hide login info
    require(['app/auth-logic']);

    require(['app/datacontext', 'app/cookie-helper'], function (appDatacontext, cookieHelper) {
        // Remove AUTH httponly cookie and is_auth cookie
        appDatacontext.accountLogoff().done(function () {
            cookieHelper.removeCookie('{{syst.cookieIsAuth}}');
            // After logoff navigate to the main page
            window.location.href = '/';
        });
    });
});