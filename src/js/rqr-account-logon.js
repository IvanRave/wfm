require(['require-config'], function () {
    'use strict';
    // Show or hide login info
    require(['app/auth-logic']);

    require(['jquery', 'angular', 'app/account/logon/project'], function ($, angular, logonProject) {
        $(function () {
            var logonProjectWrap = document.getElementById('logon-project-wrap');
            angular.bootstrap(logonProjectWrap, [logonProject.name]);
            $(logonProjectWrap).removeClass('hide');
        });
    });
});