require(['require-config'], function () {
    'use strict';

    // Show or hide login info
    require(['app/auth-logic']);

    require(['jquery', 'angular', 'app/account/register/project'], function ($, angular, registerProject) {
        $(function () {
            var registerProjectWrap = document.getElementById('register-project-wrap');
            angular.bootstrap(registerProjectWrap, [registerProject.name]);
            $(registerProjectWrap).removeClass('hide');
        });
    });
});