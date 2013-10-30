define([], function () {
    requirejs.config({
        baseUrl: '/scripts',
        paths: {
            'jquery': 'jquery-2.0.3.min',
            'dom-ready': 'dom-ready.min',
            'lightbox': 'lightbox',
            'ko': 'knockout-3.0.0', // minified version
            'ko.external-template': 'koExternalTemplateEngine-amd.min',
            'angular': 'angular',
            'angular-route': 'angular-route',
            'angular-resource': 'angular-resource',
            'ng-upload': 'ng-upload.min',
            'infuser': 'infuser-amd.min',
            'trafficcop': 'TrafficCop-amd.min',
            'slimscroll': 'jquery.slimscroll.min',
            'jquery.jcrop': 'jquery.Jcrop.min',
            'jquery.bootstrap': 'bootstrap.min',
            'moment': 'moment.min', // no deps
            // The jQuery UI widget factory, can be omitted if jQuery UI is already included 
            'jquery.ui.widget': 'ajaxupload/vendor/jquery.ui.widget',
            // The Iframe Transport is required for browsers without support for XHR file uploads 
            'jquery.iframe-transport': 'ajaxupload/jquery.iframe-transport',
            // The basic File Upload plugin
            'jquery.fileupload': 'ajaxupload/jquery.fileupload',
            'yandex-map': 'http://api-maps.yandex.ru/2.0/?load=package.full&lang=en-US',
            'wysihtml5': 'wysihtml5-0.3.0.min',
            'bootstrap-wysihtml5': 'bootstrap-wysihtml5',
            'bootstrap-datepicker': 'bootstrap-datepicker.min',
            'blob-js': 'blobjs/Blob.min',
            'blob-builder': 'blobjs/BlobBuilder.min',
            'filesaver': 'filesaverjs/filesaver.min',
            'jspdf': 'jspdf/jspdf',
            'jspdf.plugin.addimage': 'jspdf/jspdf.plugin.addimage',
            'jspdf.plugin.cell': 'jspdf/jspdf.plugin.cell',
            'jspdf.plugin.from_html': 'jspdf/jspdf.plugin.from_html',
            'jspdf.plugin.ie_below_9_shim': 'jspdf/jspdf.plugin.ie_below_9_shim',
            'jspdf.plugin.javascript': 'jspdf/jspdf.plugin.javascript',
            'jspdf.plugin.sillysvgrenderer': 'jspdf/jspdf.plugin.sillysvgrenderer',
            'jspdf.plugin.split_text_to_size': 'jspdf/jspdf.plugin.split_text_to_size',
            'jspdf.plugin.standard_fonts_metrics': 'jspdf/jspdf.plugin.standard_fonts_metrics',
            'jspdf.PLUGINTEMPLATE': 'jspdf/jspdf.PLUGINTEMPLATE'
        },
        shim: {
            // Shim config does not work after optimization builds with CDN resources.
            // Need only for 3-rd side libraries when no AMD
            // bootstrap - set module define it it's file
            ////'jquery.bootstrap': {
            ////    deps: ['jquery'],
            ////    exports: '$'
            ////},
            'jquery.jcrop': { deps: ['jquery'] },
            'lightbox': { deps: ['jquery'] },
            'slimscroll': { deps: ['jquery'] },
            'angular': { deps: ['jquery'], exports: 'angular' }, // work: angular.module and other
            'angular-route': { deps: ['angular'] },
            'angular-resource': { deps: ['angular'] },
            'ng-upload': { deps: ['angular'] },
            'bootstrap-wysihtml5': { deps: ['jquery'] },
            'bootstrap-datepicker': { deps: ['jquery.bootstrap'] },
            'jspdf.plugin.addimage': { deps: ['jspdf'] },
            'jspdf.plugin.cell': { deps: ['jspdf'] },
            'jspdf.plugin.from_html': { deps: ['jspdf'] },
            'jspdf.plugin.ie_below_9_shim': { deps: ['jspdf'] },
            'jspdf.plugin.javascript': { deps: ['jspdf'] },
            'jspdf.plugin.sillysvgrenderer': { deps: ['jspdf'] },
            'jspdf.plugin.split_text_to_size': { deps: ['jspdf'] },
            'jspdf.plugin.standard_fonts_metrics': { deps: ['jspdf'] },
            'jspdf.PLUGINTEMPLATE': { deps: ['jspdf'] }
        }
        // need define or exports for each module
        // enforceDefine: true
    });
});