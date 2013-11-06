// Controllers (directives) for company page
// requirejs: app/cabinet/controllers
// angular: ang-cabinet-controllers

define(['jquery', 'angular', 'app/datacontext', 'angular-route', 'app/app-resource', 'app/cabinet/services', 'app/app-filters'], function ($, angular, appDatacontext) {
    'use strict';

    return angular.module('ang-cabinet-controllers', ['ngRoute', 'ang-app-resource', 'ang-cabinet-services', 'ang-app-filters'])
    .controller('CompanyUserCtrl', ['$scope', 'SharedService', function (scp, sharedService) {
        scp.accessLevelDict = sharedService.getSharedObject().accessLevelDict;

        scp.isLoadedCompanyUserList = false;

        scp.companyUserList = [];

        // Get company list
        appDatacontext.getCompanyUserList().done(function (response) {
            scp.$apply(function () {
                scp.companyUserList = response;
                scp.isLoadedCompanyUserList = true;
            });
        });

        scp.isOwnerAlready = function () {
            // when user is company owner already then block link "register company"
            // if AccessLevel == 0 then block link
            var result = false;

            $.each(scp.companyUserList, function (companyUserIndex, companyUserValue) {
                if ((parseInt(companyUserValue.AccessLevel, 10) & sharedService.getOwnerAccessCode()) > 0) {
                    // find need value and break this cycle
                    result = true;
                    return false;
                }
                else {
                    // continue cycle
                    return true;
                }
            });

            return result;
        };
    }])
    .controller('CompanyCreateCtrl', ['$scope', '$location', function (scp, angLocation) {
        scp.isPostSended = false;
        scp.postCompany = function () {
            scp.isPostSended = true;
            scp.companyNew.LogoUrl = '';
            appDatacontext.postCompany({}, scp.companyNew).done(function () {
                angLocation.path('/all');
            })
            .fail(function (jqXhr) {
                if (jqXhr.status === 422) {
                    require(['app/lang-helper'], function (langHelper) {
                        // Because using jQuery ajax is out of the world of angular, you need to wrap your $scope assignment inside of
                        scp.$apply(function () {
                            scp.processError = (langHelper.translate(jqXhr.responseJSON.errId) || '{{lang.unknownError}}');
                        });
                    });
                }
            })
            .always(function () {
                scp.$apply(function () {
                    // Activate button for sending request one more time (like 'try later' or need to change some fields)
                    scp.isPostSended = false;
                });
            });
        };
    }])
    .controller('CompanyManageInfoCtrl', ['$scope', '$routeParams', function (angScope, angRouteParams) {
        // Check company id as Guid
        if (!angRouteParams.id || /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(angRouteParams.id) === false) { return; }

        // TODO: Make url query for CORS
        // TODO: Get url query from datacontext companyUrl function
        angScope.setFileUpload = function () {
            require(['app/file-helper'], function (fileHelper) {
                var fileUploadInput = document.getElementById('company-logo-file-upload');
                fileHelper.initFileUpload(fileUploadInput, '{{conf.requrl}}/api/company?id=' + angRouteParams.id, ['image/png', 'image/jpeg', 'image/gif'], function (respImg) {
                    angScope.$apply(function () {
                        // apply logo from response: plus unique hash for update img in html
                        angScope.company.LogoUrl = respImg.LogoUrl + "?" + new Date().getTime();
                    });
                });
            });
        };

        // load company info
        angScope.isLoadedCompany = false;

        appDatacontext.getCompany({ id: angRouteParams.id }).done(function (response) {
            angScope.$apply(function () {
                angScope.companyOriginal = response;
                angScope.company = angular.copy(angScope.companyOriginal);
                angScope.isLoadedCompany = true;
            });
        });

        angScope.isClean = function () {
            return angular.equals(angScope.companyOriginal, angScope.company);
        };

        angScope.putCompany = function () {
            appDatacontext.putCompany({ id: angRouteParams.id }, angScope.company).done(function (response) {
                angScope.$apply(function () {
                    angScope.companyOriginal = response;
                });
            });
        };
    }])
    .controller('CompanyManageUserCtrl', ['$scope', '$routeParams', 'SharedService', function (angScope, angRouteParams, sharedService) {
        if (!angRouteParams.id || /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(angRouteParams.id) === false) { return; }

        angScope.companyUserList = [];
        angScope.isLoadedCompanyUserList = false;

        // Load company users
        appDatacontext.getCompanyUserList({ company_id: angRouteParams.id }).done(function (response) {
            angScope.$apply(function () {
                angScope.companyUserList = response;
                angScope.isLoadedCompanyUserList = true;
            });
        });

        angScope.accessLevelDict = sharedService.getSharedObject().accessLevelDict;

        angScope.companyUserNew = {
            CompanyId: angRouteParams.id,
            AccessLevel: 0,
            UserProfileDto: {
                Email: ''
            }
        };

        ////angScope.postCompanyUser = function () {
        // TODO: change to appDatacontext
        ////    companyUserFactory.post(angScope.companyUserNew, function (createdCompanyUser) {
        ////        angScope.companyUserList.push(createdCompanyUser);
        ////        angScope.companyUserNew.UserProfileDto.Email = '';
        ////    }, function (errorResult) {
        ////        if (errorResult.data && errorResult.data.Message) {
        ////            alert('Error: ' + errorResult.data.Message);
        ////        }
        ////    });
        ////};
    }]);
});