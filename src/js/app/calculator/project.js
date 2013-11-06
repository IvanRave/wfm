define(['jquery', 'knockout', 'app/calculator/viewmodel', 'jquery.bootstrap', 'app/bindings'], function ($, ko, CalcViewModel) {
    'use strict';
    $(function () {
        ko.applyBindings(new CalcViewModel());
    });
});