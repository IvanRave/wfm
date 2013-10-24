// Admin page project (angular)

define(['angular', 'app/admin/controllers', 'angular-route'], function (angular, appAdminControllers) {
    'use strict';

    return angular.module('ang-admin-project', [appAdminControllers.name, 'ngRoute'])
    .config(['$routeProvider', function (rpr) {
        rpr.when('/', {})
            .when('/wfmparameter', { controller: 'WfmParameterCtrl', templateUrl: '/wfm-template/admin/wfm-parameter.html' })
            .when('/company', { templateUrl: '/wfm-template/admin/company.html' })
            .otherwise({ redirectTo: '/' });
    }])
    .run(['$rootScope', '$location', function (angRootScope, angLocation) {
        angRootScope.location = angLocation;
    }]);
});