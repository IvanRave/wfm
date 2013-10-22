// Logon page project (angular)

define(['angular', 'app/account/logon/controllers'], function (angular, appLogonControllers) {
    'use strict';

    return angular.module('ang-logon-project', [appLogonControllers.name])
    .config(['$httpProvider', function (angHttpProvider) {
        angHttpProvider.defaults.withCredentials = true;
    }]);
    // For outer templates (other domains)
    ////.config(['$sceDelegateProvider', function (sceDelegateProvider) {
    ////    sceDelegateProvider.resourceUrlWhitelist(['self', /^https?:\/\/(cdn\.)?wfm.azurewebsites.net/]);
    ////}])
});