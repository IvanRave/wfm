define(['knockout',
    'app/models/widgets/widget-perfomance',
    'app/models/widgets/widget-summary',
    'app/models/widgets/widget-sketch'
], function (ko, WidgetPerfomance, WidgetSummary, WidgetSketch) {
    'use strict';

    // Supertype
    function Widget(data, widgockItem) {
        var self = this;
        data = data || {};

        self.id = data.Id;
        self.name = ko.observable(data.Name);

        self.widgetType = data.WidgetType;

        self.widgetTpl = self.widgetType + '-widget-tpl';

        self.isVisSettingPanel = ko.observable(false);

        self.showVisSettingPanel = function () {
            self.isVisSettingPanel(true);
        };

        self.saveWidget = function () {
            self.isVisSettingPanel(false);
            console.log('saved');
        };

        self.processWidget = function () {
            console.log('process widget');
        };

        if (self.widgetType === 'perfomance') {
            WidgetPerfomance.call(self, data, widgockItem);
        }
        else if (self.widgetType === 'summary') {
            WidgetSummary.call(self, data);
        }
        else if (self.widgetType === 'sketch') {
            WidgetSketch.call(self, data);
        }

        ////self.save = function () {

        ////};

        ////self.remove = function () {

        ////};
    }

    return Widget;
});