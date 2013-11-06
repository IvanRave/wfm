require(['require-config'], function () {
    'use strict';

    // Show or hide login info
    require(['app/auth-logic']);

    require(['jquery', 'angular', 'app/cabinet/project', 'jquery.bootstrap'], function ($, angular, cabinetProject) {
        // Using jQuery dom ready because it will run this even if DOM load already happened
        $(function () {
            angular.bootstrap(document.getElementById('cabinet-project-wrap'), [cabinetProject.name]);
        });
    });
});