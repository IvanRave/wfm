// Controllers for logon page

define(['angular', 'app/datacontext', 'app/cookie-helper'], function (angular, appDatacontext, cookieHelper) {
    'use strict';

    return angular.module('ang-logon-controllers', [])
    .controller('LogonCtrl', ['$scope', '$window', function (scp, $window) {

        scp.isLoginBtnEnabled = true;

        scp.loginError = '';

        scp.tryAuth = function () {
            scp.isLoginBtnEnabled = false;
            appDatacontext.accountLogon({}, scp.usver).done(function (res) {
                console.log(res);
                if (res === true) {
                    cookieHelper.createCookie('{{syst.cookie_is_auth}}', 'true');
                    // Navigate to company list
                    window.location.href = '/company/{{conf.defPage}}';
                }
                else {
                    // Because using jQuery ajax is out of the world of angular, you need to wrap your $scope assignment inside of
                    scp.$apply(function () {
                        scp.loginError = '{{titleize lang.error}}: {{lang.wrongCredentials}}';
                    });
                }
            }).always(function () {
                // When error or smth activate login button
                scp.$apply(function () {
                    scp.isLoginBtnEnabled = true;
                });
            })
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