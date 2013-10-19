// Admin page project (angular)

define(['angular', 'app/admin/controllers', 'angular-route'], function (angular, appAdminControllers) {
    'use strict';

    return angular.module('ang-admin-project', [appAdminControllers.name, 'ngRoute'])
    .config(['$routeProvider', function (rpr) {
        rpr.when('/', {})
            .when('/wfmparameter', { controller: 'WfmParameterCtrl', templateUrl: '/admin/wfmparameter' })
            .when('/company', { templateUrl: '/admin/company' })
            .otherwise({ redirectTo: '/' });
    }])
    .run(['$rootScope', '$location', function (angRootScope, angLocation) {
        angRootScope.location = angLocation;
    }]);
});