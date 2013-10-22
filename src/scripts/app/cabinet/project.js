// Project for cabinet page
// require: app/cabinet/project
// angular: ang-cabinet-project

define(['angular', 'angular-route', 'app/cabinet/controllers'], function (angular, angRoute) {
    'use strict';

    return angular.module('ang-cabinet-project', ['ngRoute', 'ang-cabinet-controllers'])
        .config(['$routeProvider', '$httpProvider', '$interpolateProvider', function (rpr, angHttpProvider, angInterpolateProvider) {
            rpr.when('/all', { controller: 'CompanyUserCtrl', templateUrl: '/wfm-template/cabinet/company-list.html' })
                .when('/create', { controller: 'CompanyCreateCtrl', templateUrl: '/wfm-template/cabinet/company-create.html' })
                .when('/:id/manage/info', { controller: 'CompanyManageInfoCtrl', templateUrl: '/wfm-template/cabinet/manage-info.html' })
                .when('/:id/manage/user', { controller: 'CompanyManageUserCtrl', templateUrl: '/wfm-template/cabinet/manage-user.html' })
                .otherwise({ redirectTo: '/all' });

            // Turn in CORS cookie support
            angHttpProvider.defaults.withCredentials = true;

            // Change standard curly braces tempate engine to {[{value}]}
            angInterpolateProvider.startSymbol('{[{').endSymbol('}]}');
        }])
        .run(function () { });

    // Configuration blocks - get executed during the provider registrations and configuration phase. 
    // Only providers and constants can be injected into configuration blocks. 
    // This is to prevent accidental instantiation of services before they have been fully configured.

    // Run blocks - get executed after the injector is created and are used to kickstart the application. 
    // Only instances and constants can be injected into run blocks. 
    // This is to prevent further system configuration during application run time.
});
