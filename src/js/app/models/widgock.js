define(['jquery', 'knockout', 'app/models/widget'], function ($, ko, Widget) {
    'use strict';

    // Well widget layout list
    function importWidgetList(data, widgockItem) {
        return $.map(data || [], function (item) { return new Widget(item, widgockItem); });
    }

    // Widget block of widget layout
    // Widget layout divides to widget blocks
    // Widget block divibed to widgets
    function Widgock(data, widgoutItem) {
        var self = this;
        data = data || {};

        self.getWidgout = function () {
            return widgoutItem;
        };

        self.id = data.Id;
        self.orderNumber = ko.observable(data.OrderNumber);
        self.columnCount = ko.observable(data.ColumnCount);

        self.columnStyle = ko.computed({
            read: function () {
                return 'col-md-' + ko.unwrap(self.columnCount);
            },
            deferEvaluation: true
        });

        self.widgetList = ko.observableArray(importWidgetList(data.WidgetDtoList, self));
    }

    return Widgock;
});