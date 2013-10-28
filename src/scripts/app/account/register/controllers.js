define(['angular', 'app/datacontext'], function (angular, appDatacontext) {
    'use strict';

    return angular.module('ang-register-controllers', [])
    .controller('RegisterCtrl', ['$scope', '$window', function (scp, angWindow) {
        scp.isProcessBtnEnabled = true;

        scp.processError = '';

        // Password restriction bounds
        scp.bound = {
            password: {
                minLength: 6,
                maxLength: 18
            }
        };

        scp.tryRegister = function () {
            scp.isProcessBtnEnabled = false;
            appDatacontext.accountRegister({}, scp.usver).done(function () {
                angWindow.alert('Success. Please check your email to confirm registration.');
                // TODO:
                // Send to email-confirm-sending
            })
            .fail(function (jqXhr) {
                if (jqXhr.status === 422) {
                    require(['app/lang-helper'], function (langHelper) {
                        // Because using jQuery ajax is out of the world of angular, you need to wrap your $scope assignment inside of
                        scp.$apply(function () {
                            scp.processError = (langHelper.translate(jqXhr.responseJSON.errId) || '{{lang.unknownError}}');
                        });
                    });
                }
            })
            .always(function () {
                // When error or smth activate button
                scp.$apply(function () {
                    scp.isProcessBtnEnabled = true;
                });
            });
        };
    }]);
});