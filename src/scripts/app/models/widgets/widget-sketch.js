define(['ko', 'app/models/widget'], function (ko, widget) {
    'use strict';

    // Subtype from Widget
    function WidgetPerfomance(data) {
        var self = this;
        data = data || {};

        widget.call(self, data);

        self.isVisImg = ko.observable(data.IsVisImg);
    }
});