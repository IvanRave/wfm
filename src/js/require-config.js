define([], function () {
    requirejs.config({
        paths: {
            'jquery.bootstrap': 'bootstrap'
        },
        shim: {
            'jquery.bootstrap': { deps: ['jquery'] }
        }
    });
});