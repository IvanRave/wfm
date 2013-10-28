// All resouces for this app (angular version)
// requirejs: app/app-resource
// angular: ang-app-resource
// conf.requrl - stores in GruntFile.js
// if exists - other domain (CORS requests - for local testing and side programs)
// if empty - the same domain (simple requests)

define(['angular', 'angular-resource'], function (angular) {
    'use strict';

    return angular.module('ang-app-resource', ['ngResource'])
     .factory('WfmParameterFactory', ['$resource', function (angResource) {
         var self = angResource('{{conf.requrl}}/api/wfmparameter',
                     {}, {
                         // default:
                         //  'get':    {method:'GET'},
                         //  'save':   {method:'POST'},
                         //  'query':  {method:'GET', isArray:true},
                         //  'remove': {method:'DELETE'},
                         //   'delete': {method:'DELETE'} }
                         // PUT or PATH
                         post: { method: 'POST', isArray: false },
                         put: { method: 'PUT', isArray: false }
                     });
         return self;
     }])
     .factory('AccessLevelFactory', ['$resource', function (angResource) {
         var self = angResource('{{conf.requrl}}/api/accesslevel', {}, {});
         return self;
     }]);
});