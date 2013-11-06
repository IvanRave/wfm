require(['require-config'], function () {
    'use strict';

    // Show or hide login info
    require(['app/auth-logic']);

    require(['jquery', 'jquery.bootstrap', 'app/calculator/project']);
});