// Controllers for logon page

define(['angular', 'app/datacontext', 'app/cookie-helper'], function (angular, appDatacontext, cookieHelper) {
    'use strict';

    return angular.module('ang-logon-controllers', [])
    .controller('LogonCtrl', ['$scope', '$window', function (scp, angWindow) {
        scp.isProcessBtnEnabled = true;

        scp.processError = '';

        // Password restriction bounds
        scp.bound = {
            password: {
                minLength: 6,
                maxLength: 18
            }
        };

        scp.tryAuth = function () {
            scp.isProcessBtnEnabled = false;
            appDatacontext.accountLogon({}, scp.usver).done(function () {
                cookieHelper.createCookie('{{syst.cookieIsAuth}}', 'true');
                // Navigate to company list
                angWindow.location.href = '/company/{{conf.defPage}}';
            })
            .fail(function (jqXHR) {
                if (jqXHR.status === 422) {
                    var resJson = jqXHR.responseJSON;
                    var tmpProcessError = '*';
                    require(['app/lang-helper'], function (langHelper) {
                        tmpProcessError += (langHelper.translate(resJson.errId) || '{{lang.unknownError}}');
                        // Because using jQuery ajax is out of the world of angular, you need to wrap your $scope assignment inside of
                        scp.$apply(function () {
                            scp.processError = tmpProcessError;
                        });
                    });
                }
            })
            .always(function () {
                // When error or smth activate login button
                scp.$apply(function () {
                    scp.isProcessBtnEnabled = true;
                });
            });
        };

        scp.isTestLoginBtnEnabled = true;

        scp.testAuth = function () {
            scp.isTestLoginBtnEnabled = false;
            appDatacontext.accountLogon({}, {
                "Email": "wfm@example.com",
                "Password": "123321"
            }).done(function () {
                cookieHelper.createCookie('{{syst.cookieIsAuth}}', 'true');
                // Navigate to company list
                window.location.href = '/company/{{conf.defPage}}';
            });
        };
    }]);
});