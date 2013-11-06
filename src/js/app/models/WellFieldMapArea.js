define(['jquery', 'knockout', 'app/datacontext', 'app/app-helper'], function ($, ko, datacontext, appHelper) {
    'use strict';

    function WellFieldMapArea(data, wellFieldMap) {
        var self = this;
        data = data || {};

        self.getWellFieldMap = function () {
            return wellFieldMap;
        };

        self.Id = data.Id;
        self.Name = ko.observable(data.Name);
        self.Description = ko.observable(data.Description);

        // longitude, latitude ... string
        // 115,129.6875 148,181.1875 102,213.6875 94.5,172.6875 115,129.6875
        self.Coords = ko.observable(data.Coords);

        self.WellFieldMapId = data.WellFieldMapId;
        self.Opacity = ko.observable(data.Opacity);
        self.StrokeWidth = ko.observable(data.StrokeWidth);
        self.FillColor = ko.observable(data.FillColor);

        // move to map model
        var tileLength = 255;
        var mapCoordScale = Math.max(self.getWellFieldMap().Width, self.getWellFieldMap().Height) / tileLength;

        // <return>[[12,43], [23,43]]
        self.coordsFromTopLeft = ko.computed(function () {
            var needArr = [];
            $.each(self.Coords().split(' '), function (elemIndex, elemValue) {
                var tempArr = elemValue.split(',');
                var longitude = parseFloat(tempArr[0]),
                    latitude = parseFloat(tempArr[1]);

                var coordX = latitude * mapCoordScale;
                var coordY = (tileLength - longitude) * mapCoordScale;

                needArr.push([coordX, coordY]);
            });

            return needArr;
        });

        self.deleteWellFieldMapArea = function () {
            datacontext.deleteWellFieldMapArea(self).done(function () {
                self.getWellFieldMap().WellFieldMapAreas.remove(self);
            });
        };

        self.saveChangedWellFieldMapArea = function () {
            datacontext.saveChangedWellFieldMapArea(self);
        };

        self.areaSize = ko.computed(function () {
            var squareCoeff = Math.pow(self.getWellFieldMap().ScaleCoefficient(), 2);
            var area = appHelper.getArea(appHelper.stringToTwoDimArray(self.Coords())); // square meters

            // convert to feet 1 feet = 0.3048 m, 1 sq ft = Math.pow(0.3048, 2)
            area = area / Math.pow(0.3048, 2);

            return area * squareCoeff;
        });

        self.toPlainJson = function () { return ko.toJS(self); };
    }

    datacontext.createWellFieldMapArea = function (item, wellFieldMapParent) {
        return new WellFieldMapArea(item, wellFieldMapParent);
    };
});