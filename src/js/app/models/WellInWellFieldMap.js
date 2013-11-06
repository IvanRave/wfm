define(['knockout', 'app/datacontext'], function (ko, datacontext) {

    function WellInWellFieldMap(data, wellFieldMap) {
        var self = this;
        data = data || {};

        self.getWellFieldMap = function () {
            return wellFieldMap;
        };

        self.longitude = ko.observable(data.Longitude);
        self.latitude = ko.observable(data.Latitude);
        self.WellFieldMapId = data.WellFieldMapId;
        // change well - remove and create object
        self.WellId = data.WellId;

        var tileLength = 255;
        var mapCoordScale = Math.max(self.getWellFieldMap().Width, self.getWellFieldMap().Height) / tileLength;

        self.coordX = ko.computed(function () {
            return self.latitude() * mapCoordScale;
        });

        self.coordY = ko.computed(function () {
            return (tileLength - self.longitude()) * mapCoordScale;
        });

        ////var tileLength = 255;
        ////var coordX = 0, coordY = 0;
        ////// if width > height
        ////var mapCoordScale = Math.max(self.Width, self.Height) / tileLength;

        ////coordX = latitude * mapCoordScale;
        ////coordY = (tileLength - longitude) * mapCoordScale;

        self.getWell = function () {
            var wellFieldItem = self.getWellFieldMap().getWellField();
            for (var WellGroupKey = 0; WellGroupKey < wellFieldItem.WellGroups().length; WellGroupKey++) {
                for (var WellKey = 0; WellKey < wellFieldItem.WellGroups()[WellGroupKey].Wells().length; WellKey++) {
                    if (wellFieldItem.WellGroups()[WellGroupKey].Wells()[WellKey].Id === self.WellId) {
                        return wellFieldItem.WellGroups()[WellGroupKey].Wells()[WellKey];
                    }
                }
            }

            return null;
        };

        self.deleteWellInWellFieldMap = function () {
            // TODO: are you sure dialog
            datacontext.deleteWellInWellFieldMap({ 'well_id': self.WellId, 'wellfieldmap_id': self.WellFieldMapId }).done(function () {
                // remove from map
                // GOTO: create parent in header; delete from parent array
                self.getWellFieldMap().WellInWellFieldMaps.remove(self);
            });
        };

        self.toPlainJson = function () { return ko.toJS(self); };
    }

    datacontext.createWellInWellFieldMap = function (item, parent) {
        return new WellInWellFieldMap(item, parent);
    };
});