// Controllers for logon page

define(['angular', 'app/app-resource', 'app/cookie-helper'], function (angular, appResource, cookieHelper) {
    'use strict';

    return angular.module('ang-logon-controllers', [appResource.name])
    .controller('LogonCtrl', ['$scope', 'AccountFactory', '$window', function (scp, accountFactory, $window) {
        scp.tryAuth = function () {
            console.log(scp.usver);
            accountFactory.post(scp.usver, function (res) {
                console.log(res);
                // TODO: change to check TRUE
                if (res) {
                    // add any value to is_auth cookie
                    cookieHelper.createCookie('{{syst.cookie_is_auth}}', 'true');
                    ////$window.location.href = "/company/";
                }

                console.log(res);
            });
        };
    }]);
});