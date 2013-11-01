define(['ko'], function (ko) {
    'use strict';

    // Subtype from Widget
    function WidgetSketch(data) {
        var self = this;
        data = data || {};

        self.isVisImg = ko.observable(data.IsVisImg);
        self.isVisDescription = ko.observable(data.IsVisDescription);
    }

    return WidgetSketch;
});