require(['require-config'], function () {
    'use strict';

    // Show or hide login info
    require(['app/auth-logic']);

    require(['jquery', 'app/app-helper', 'app/datacontext'], function ($, appHelper, appDatacontext) {
        var confirmationEmail = decodeURIComponent(appHelper.queryString['email']),
            confirmationToken = appHelper.queryString['token'];

        if (confirmationEmail && confirmationToken) {
            appDatacontext.accountRegisterConfirmation({}, { 'Email': confirmationEmail, 'Token': confirmationToken })
            .done(function () {
                $('#confirmation-success').removeClass('hide');
            })
            .fail(function () {
                $('#confirmation-failure').removeClass('hide');
            });
        }
    });
});