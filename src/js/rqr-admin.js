require(['require-config'], function () {
    'use strict';

    // Show or hide login info
    require(['app/auth-logic']);

    require(['jquery', 'angular', 'app/admin/project', 'jquery.bootstrap'], function ($, angular, adminProject) {
        $(function () {
            angular.bootstrap(document.getElementById('admin-project-wrap'), [adminProject.name]);
        });
    });
});