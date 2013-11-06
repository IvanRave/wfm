// Services for cabinet page
// requirejs: app/cabinet-services
// angular: ang-cabinet-services

define(['angular', 'app/app-resource'], function (angular) {
    return angular.module('ang-cabinet-services', ['ang-app-resource'])
    .service('SharedService', ['AccessLevelFactory', function () {
        // private variable
        var sharedObject = {
            ////prop3: 'test property',
            ////accessLevelDict: accessLevelFactory.get()
            accessLevelDict: {
                "CanManageAll": { "AccessCode": 1, "Description": "Can manage" },
                "CanEditAll": { "AccessCode": 2, "Description": "Can edit" },
                "CanViewAll": { "AccessCode": 4, "Description": "Can view" }
            }
        };

        return {
            // public methods
            getSharedObject: function () {
                return sharedObject;
            },
            getOwnerAccessCode: function () {
                return sharedObject.accessLevelDict.CanManageAll.AccessCode;
            }
        };
    }]);
});