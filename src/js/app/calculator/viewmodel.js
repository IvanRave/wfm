define(['jquery', 'knockout', 'bootstrap-slider'], function ($, ko) {
    'use strict';

    function CalcViewModel() {
        var self = this;

        self.wellCount = ko.observable(3);
        self.wellCountPrice = ko.computed(function () {
            var price = 0,
                freeCount = 3,
                unitPrice = 7.99;

            if (self.wellCount() > freeCount) {
                price = ((self.wellCount() - freeCount) * unitPrice).toFixed(2);
            }

            return price;
        });

        self.changeWellCount = function (viewModelItem, event) {
            self.wellCount(event.value);
            $(event.currentTarget).slider('setValue', event.value);
        };

        self.cloudSpace = ko.observable(100);
        self.cloudSpacePrice = ko.computed(function () {
            var price = 0,
                freeCount = 100,
                unitPrice = 0.001;
            if (self.cloudSpace() > freeCount) {
                price = ((self.cloudSpace() - freeCount) * unitPrice).toFixed(2);
            }

            return price;
        });

        self.changeCloudSpace = function (viewModelItem, event) {
            self.cloudSpace(event.value);
            $(event.currentTarget).slider('setValue', event.value);
        };

        self.viewerCount = ko.observable(3);
        self.viewerCountPrice = ko.computed(function () {
            var price = 0,
                freeCount = 3,
                viewerPrice = 15;
            if (self.viewerCount() > freeCount) {
                price = ((self.viewerCount() - freeCount) * viewerPrice).toFixed(2);
            }

            return price;
        });

        self.changeViewerCount = function (viewModelItem, event) {
            self.viewerCount(event.value);
            $(event.currentTarget).slider('setValue', event.value);
        };

        self.total = ko.computed(function () {
            return (parseFloat(self.wellCountPrice()) + parseFloat(self.cloudSpacePrice()) + parseFloat(self.viewerCountPrice())).toFixed(2);
        });
    }

    return CalcViewModel;
});