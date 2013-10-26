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
                angWindow.alert('success');
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
                // When error or smth activate button
                scp.$apply(function () {
                    scp.isProcessBtnEnabled = true;
                });
            });
        };
    }]);
});