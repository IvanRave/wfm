define(['ko', 'app/models/widget'], function (ko, widget) {
    'use strict';

    // Subtype
    function WidgetSummary(data) {
        var self = this;
        data = data || {};

        widget.call(self, data);

        self.isVisDescription = ko.observable(data.IsVisDescription);
    }
});