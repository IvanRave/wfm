require(['jquery', 'ko', 'app/workspace/viewmodel', 'dom-ready',
    'jquery.bootstrap', 'app/bindings', 'ko.external-template',
    'jquery.ui.widget', 'jquery.iframe-transport', 'app/ajaxupload-fix', 'lightbox',
    'wysihtml5', 'bootstrap-wysihtml5', 'bootstrap-datepicker'
], function ($, ko, appViewModel, domReady) {
    'use strict';

    //This function is called once the DOM is ready.
    //It will be safe to query the DOM and manipulate
    //DOM nodes in this function.
    domReady(function () {
        ko.applyBindings(appViewModel);

        var $window = $(window);
        $window.resize(function () {
            appViewModel.windowHeight($window.height());
            appViewModel.windowWidth($window.width());
        });
    });
});