define(['ko'], function (ko) {
    'use strict';

    // Subtype from Widget
    function WidgetPerfomance(data, widgockItem) {
        var self = this;
        data = data || {};

        self.isVisGraph = ko.observable(data.IsVisGraph);

        self.perfomanceView = widgockItem.getWidgout().getWell().perfomancePartial.createPerfomanceView({
            isVisibleForecastData: true,
            selectedAttrGroupId: 'Rate'
            ////endYear: 2010,
            ////startYear: 2007
        });
    }

    return WidgetPerfomance;
});