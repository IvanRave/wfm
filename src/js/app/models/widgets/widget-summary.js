define(['knockout'], function (ko) {
    'use strict';

    // Widget for summary well info
    function WidgetSummary(data) {
        var self = this;
        data = data || {};

        self.isVisName = ko.observable(data.IsVisName);
        self.isVisDescription = ko.observable(data.IsVisDescription);
        self.isVisProductionHistory = ko.observable(data.IsVisProductionHistory);
    }

    return WidgetSummary;
});