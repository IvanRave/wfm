// Filters for all app (angular)
// requirejs: app/app-filters
// angular: ang-app-filters

define(['angular'], function (angular) {
    'use strict';

    return angular.module('ang-app-filters', [])
    .filter('bitwiseand', function () {
        return function (firstNumber, secondNumber) {
            return ((parseInt(firstNumber, 10) & parseInt(secondNumber, 10)) === parseInt(secondNumber, 10));
        };
    });
});