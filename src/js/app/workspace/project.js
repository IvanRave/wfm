require(['jquery', 'knockout', 'app/workspace/viewmodel',
    'jquery.bootstrap', 'app/bindings', 'ko-external-template-engine',
    'jquery.ui.widget', 'jquery.iframe-transport',
    // The XDomainRequest Transport is included for cross-domain file deletion for IE8+ 
    'ajaxupload/cors/jquery.xdr-transport',
    'ajaxupload/cors/jquery.postmessage-transport',
    'jquery.lightbox', 'bootstrap-datepicker'],
    function ($, ko, appViewModel) {
        'use strict';

        // This function is called once the DOM is ready.
        // It will be safe to query the DOM and manipulate DOM nodes in this function.
        $(function () {
            ko.applyBindings(appViewModel);
            var $window = $(window);
            $window.resize(function () {
                appViewModel.windowHeight($window.height());
                appViewModel.windowWidth($window.width());
            });
        });
    });