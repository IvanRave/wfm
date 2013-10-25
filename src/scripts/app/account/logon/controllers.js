// Controllers for logon page

define(['angular', 'app/datacontext', 'app/cookie-helper'], function (angular, appDatacontext, cookieHelper) {
    'use strict';

    return angular.module('ang-logon-controllers', [])
    .controller('LogonCtrl', ['$scope', '$window', function (scp, angWindow) {
        scp.isLoginBtnEnabled = true;

        scp.loginError = ''; 

        scp.tryAuth = function () {
            scp.isLoginBtnEnabled = false;
            appDatacontext.accountLogon({}, scp.usver).done(function () {
                cookieHelper.createCookie('{{syst.cookie_is_auth}}', 'true');
                // Navigate to company list
                angWindow.location.href = '/company/{{conf.defPage}}';
            })
            .fail(function (jqXHR) {
                if (jqXHR.status === 422) {
                    var resJson = jqXHR.responseJSON;
                    var tmpLoginError = '{{capitalizeFirst lang.error}}: ';
                    if (resJson.errId === 'wrongCredentials') {
                        tmpLoginError += 'wrong credentials';
                    }
                    else if (resJson.errId === 'emailIsNotConfirmed') {
                        tmpLoginError += 'email is not confirmed';
                    }
                    else {
                        tmpLoginError += '{{lang.unknownError}}';
                    }
                    // Because using jQuery ajax is out of the world of angular, you need to wrap your $scope assignment inside of
                    scp.$apply(function () {
                        scp.loginError = tmpLoginError;
                    });
                }
            })
            .always(function () {
                // When error or smth activate login button
                scp.$apply(function () {
                    scp.isLoginBtnEnabled = true;
                });
            });
        };

        scp.isTestLoginBtnEnabled = true;

        scp.testAuth = function () {
            scp.isTestLoginBtnEnabled = false;
            appDatacontext.accountLogon({}, {
                "Email": "wfm@example.com",
                "Password": "123321"
            }).done(function (res) {
                if (res === true) {
                    cookieHelper.createCookie('{{syst.cookie_is_auth}}', 'true');
                    // Navigate to company list
                    window.location.href = '/company/';
                }
                else {
                    alert('Unknown error. Please try again');
                }
            });
        };
    }]);
});