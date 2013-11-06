// Logon page project (angular)

define(['angular', 'app/account/logon/controllers'], function (angular, appLogonControllers) {
    'use strict';

    return angular.module('ang-logon-project', [appLogonControllers.name])
    .config(['$httpProvider', '$interpolateProvider', function (angHttpProvider, angInterpolateProvider) {
        ////angHttpProvider.defaults.withCredentials = true;
        // Change standard curly braces tempate engine to {[{value}]}
        angInterpolateProvider.startSymbol('{[{').endSymbol('}]}');
    }]);
    // For outer templates (other domains)
    ////.config(['$sceDelegateProvider', function (sceDelegateProvider) {
    ////    sceDelegateProvider.resourceUrlWhitelist(['self', /^https?:\/\/(cdn\.)?wfm.azurewebsites.net/]);
    ////}])
});