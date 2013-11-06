define(['dom-ready', 'app/cookie-helper'], function (domReady, cookieHelper) {
    'use script';

    // Can not read HTTPONLY cookies
    // Read is_auth cookie
    // is_auth and .ASPXAUTH cookies stores simultaneously
    // Every page check user auth
    // Cookie name stores in assemble_store/data/syst.json

    domReady(function () {
        if (cookieHelper.getCookie('{{syst.cookieIsAuth}}')) {
            var logoffBlock = document.getElementById('logoff_block');
            logoffBlock.className = logoffBlock.className.replace(/(?:^|\s)hide(?!\S)/, '');
        }
        else {
            var logonBlock = document.getElementById('logon_block');
            logonBlock.className = logonBlock.className.replace(/(?:^|\s)hide(?!\S)/, '');
        }
    });
});