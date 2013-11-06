define([], function () {
    'use strict';

    // Subtype from Widget
    function WidgetPerfomance(data, widgockItem) {
        var self = this;
        data = data || {};

        self.perfomanceView = widgockItem.getWidgout().getWell().perfomancePartial.createPerfomanceView({
            isVisibleForecastData: false,
            selectedAttrGroupId: data.SelectedAttrGroupId
            ////endYear: 2010,
            ////startYear: 2007
        });
    }

    return WidgetPerfomance;
});