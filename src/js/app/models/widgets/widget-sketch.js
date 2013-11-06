define(['knockout'], function (ko) {
    'use strict';

    // Widget for sketch (image plus desc)
    function WidgetSketch(data) {
        var self = this;
        data = data || {};

        self.isVisImg = ko.observable(data.IsVisImg);
        self.isVisDescription = ko.observable(data.IsVisDescription);
    }

    return WidgetSketch;
});