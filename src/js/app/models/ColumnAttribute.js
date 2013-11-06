define(['jquery', 'knockout', 'app/datacontext'], function ($, ko, datacontext) {
    'use strict';

    function ColumnAttribute(data) {
        var self = this;
        data = data || {};

        self.Id = data.Id;
        self.Name = data.Name;
        self.Format = ko.observable(data.Format);

        self.numeratorList = data.NumeratorList;
        self.denominatorList = data.DenominatorList;
        // properties
        self.Title = data.Title || '';

        self.Group = data.Group || null;

        self.IsVisible = ko.observable(data.IsVisible || false);

        self.IsCalc = ko.observable(data.IsCalc || false);

        self.AssId = data.AssId;

        self.curveColor = data.CurveColor;

        self.GraphCurveId = ko.observable();

        var trackIsVisible = function () {
            if (self.IsVisible() === true) {
                $('.class' + self.Name).removeClass('hidden');
            }
            else {
                $('.class' + self.Name).addClass('hidden');
            }
        };

        self.IsVisible.subscribe(trackIsVisible);

        self.turnCheck = function () {
            self.IsVisible(!self.IsVisible());
        };

        self.convertUom = function (uomName) {
            self.Format(uomName);
        };

        self.toPlainJson = function () {
            return ko.toJS(self);
        };
    }

    datacontext.createColumnAttribute = function (data) {
        return new ColumnAttribute(data);
    };
});