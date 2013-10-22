// Controllers (directives) for company page
// requirejs: app/cabinet/controllers
// angular: ang-cabinet-controllers

define(['jquery', 'angular', 'app/datacontext', 'angular-route', 'app/app-resource', 'app/cabinet/services', 'app/app-filters'], function ($, angular, appDatacontext) {
    'use strict';

    return angular.module('ang-cabinet-controllers', ['ngRoute', 'ang-app-resource', 'ang-cabinet-services', 'ang-app-filters'])
    .controller('CompanyUserCtrl', ['$scope', 'CompanyUserFactory', 'SharedService', function (scp, companyUserFactory, sharedService) {
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

        ////scp.companyUserList = companyUserFactory.query({}, function (response) {
        ////    scp.isLoadedCompanyUserList = true;
        ////});

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
    .controller('CompanyCreateCtrl', ['$scope', '$location', 'CompanyFactory', function (scp, angLocation, companyFactory) {
        scp.isPostSended = false;
        scp.postCompany = function () {
            scp.isPostSended = true;
            scp.companyNew.LogoUrl = '';
            companyFactory.post(scp.companyNew, function (response) {
                angLocation.path('/all');
            }, function (error) {
                // show error to user
                alert(error.status === 400 ? error.data.Message : 'Unknown error');
                // activate button for sending request one more time (like 'try later' or need to change some fields)
                scp.isPostSended = false;
            });
        }
    }])
    .controller('CompanyManageInfoCtrl', ['$scope', '$routeParams', 'CompanyFactory', function (angScope, angRouteParams, companyFactory) {
        if (!angRouteParams.id || /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(angRouteParams.id) === false) {
            console.log(angRouteParams);
            console.log('no company id');
            return;
        }

        angScope.setFileUpload = function () {
            require(['app/file-helper'], function (fileHelper) {
                var fileUploadInput = document.getElementById('company-logo-file-upload');
                fileHelper.initFileUpload(fileUploadInput, '/api/company?id=' + angRouteParams.id, ['image/png', 'image/jpeg', 'image/gif'], function (respImg) {
                    angScope.$apply(function () {
                        // apply logo from response: plus unique hash for update img in html
                        angScope.company.LogoUrl = respImg.LogoUrl + "?" + new Date().getTime();
                    });
                });
            });
        };

        // load company info
        angScope.isLoadedCompany = false;

        companyFactory.get({ id: angRouteParams.id }, function (response) {
            angScope.companyOriginal = response;
            angScope.company = angular.copy(angScope.companyOriginal);
            angScope.isLoadedCompany = true;

        }, function (error) {
            alert('Error');
        })

        angScope.isClean = function () {
            return angular.equals(angScope.companyOriginal, angScope.company);
        };

        angScope.putCompany = function () {
            companyFactory.put({ id: angRouteParams.id }, angScope.company, function (response) {
                angScope.companyOriginal = response;
            }, function (error) { alert('error'); });
        };
    }])
    .controller('CompanyManageUserCtrl', ['$scope', '$routeParams', 'CompanyUserFactory', 'SharedService', function (angScope, angRouteParams, companyUserFactory, sharedService) {
        if (!angRouteParams.id || /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(angRouteParams.id) === false) { return; }
        // load company user list
        angScope.isLoadedCompanyUserList = false;

        angScope.companyUserList = companyUserFactory.query({ company_id: angRouteParams.id }, function () {
            angScope.isLoadedCompanyUserList = true;
        });

        angScope.accessLevelDict = sharedService.getSharedObject().accessLevelDict;

        angScope.companyUserNew = {
            CompanyId: angRouteParams.id,
            AccessLevel: 0,
            UserProfileDto: {
                Email: ''
            }
        };

        angScope.postCompanyUser = function () {
            companyUserFactory.post(angScope.companyUserNew, function (createdCompanyUser) {
                angScope.companyUserList.push(createdCompanyUser);
                angScope.companyUserNew.UserProfileDto.Email = '';
            }, function (errorResult) {
                if (errorResult.data && errorResult.data.Message) {
                    alert('Error: ' + errorResult.data.Message);
                }
            });
        };
    }]);
});