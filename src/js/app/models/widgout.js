define(['jquery', 'knockout', 'app/models/widgock'], function ($, ko, Widgock) {
    'use strict';

    // Well widget layout list
    function importWidgockList(data, widgoutItem) {
        return $.map(data || [], function (item) { return new Widgock(item, widgoutItem); });
    }

    // Widget layout
    function Widgout(data) {
        var self = this;
        data = data || {};

        self.id = data.Id;
        self.name = ko.observable(data.Name);

        self.widgockList = ko.observableArray(importWidgockList(data.WidgockDtoList, self));

        ////// Load widget block list
        ////self.widgockList(importWidgockList(data.WidgockDtoList));
    }

    return Widgout;
});