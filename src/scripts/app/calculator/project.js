define(['jquery', 'ko', 'app/calculator/viewmodel', 'jquery.bootstrap', 'app/bindings'], function ($, ko, calcViewModel) {
    'use strict';
    $(function () { ko.applyBindings(calcViewModel); });
});