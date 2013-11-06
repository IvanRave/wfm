define(['angular', 'app/account/register/controllers'], function (angular, appRegisterControllers) {
    'use strict';

    return angular.module('ang-register-project', [appRegisterControllers.name])
    .config(['$httpProvider', '$interpolateProvider', function (angHttpProvider, angInterpolateProvider) {
        // Change standard curly braces tempate engine to {[{value}]}
        angInterpolateProvider.startSymbol('{[{').endSymbol('}]}');
    }]);
});