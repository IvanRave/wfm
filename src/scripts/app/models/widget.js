define(['ko', 'app/models/widgets/widget-perfomance'], function (ko, WidgetPerfomance) {
    'use strict';

    // Supertype
    function Widget(data, widgockItem) {
        var self = this;
        data = data || {};

        self.id = data.Id;
        self.name = ko.observable(data.Name);

        self.widgetType = data.WidgetType;

        self.widgetTpl = self.widgetType + '-tmpl';

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

        ////self.save = function () {

        ////};

        ////self.remove = function () {

        ////};
    }

    return Widget;

    ////// Subtype
    ////function WidgetPerfomance(data) {
    ////    var self = this;
    ////    data = data || {};

    ////    Widget.call(self, data);

    ////    self.isVisGraph = ko.observable(data.IsVisGraph);
    ////}

    ////// Subtype
    ////function WidgetSummary(data) {
    ////    var self = this;
    ////    data = data || {};

    ////    Widget.call(self, data);

    ////    self.isVisDescription = ko.observable(data.IsVisDescription);
    ////}
});