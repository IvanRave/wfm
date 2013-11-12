define(['jquery',
    'knockout',
    'app/datacontext',
    'app/file-helper',
    'bootstrap-modal',
    'app/models/WellGroup',
    'app/models/WellFieldMap'
], function ($, ko, datacontext, fileHelper, bootstrapModal) {
    'use strict';

    // 10. WellFieldMaps (convert data objects into array)
    function importWellFieldMapsDto(data, parent) { return $.map(data || [], function (item) { return datacontext.createWellFieldMap(item, parent); }); }

    // 3. WellGroup (convert data objects into array)
    function importWellGroupsDto(data, parent) { return $.map(data || [], function (item) { return datacontext.createWellGroup(item, parent); }); }

    function WellField(data, wellRegion) {
        var self = this;
        data = data || {};

        // Persisted properties
        self.Id = data.Id;
        self.Name = ko.observable(data.Name);

        // Foreign key
        self.WellRegionId = data.WellRegionId;
        self.getWellRegion = function () {
            return wellRegion;
        };

        self.WellGroups = ko.observableArray();
        self.selectedWellGroup = ko.observable();

        self.WellFieldMaps = ko.observableArray();
        self.selectedWellFieldMap = ko.observable();

        self.deleteWellFieldMap = function () {
            var itemToDelete = this;
            if (confirm('Are you sure you want to delete "' + itemToDelete.Name() + '"?')) {
                datacontext.deleteWellFieldMap(itemToDelete).done(function () {
                    self.WellFieldMaps.remove(itemToDelete);
                });
            }
        };

        self.getWellFieldMaps = function (callbackFunction) {
            if (self.WellFieldMaps().length === 0) {
                datacontext.getWellFieldMaps({ 'wellfield_id': self.Id }).done(function (result) {
                    self.WellFieldMaps(importWellFieldMapsDto(result, self));

                    if ($.isFunction(callbackFunction) === true) {
                        callbackFunction();
                    }
                });
            }
            else {
                if ($.isFunction(callbackFunction) === true) {
                    callbackFunction();
                }
            }
        };

        self.initMapFileUpload = function () {
            var mapFileInput = document.getElementById('map_file_upload');
            fileHelper.initFileUpload(mapFileInput, datacontext.getWellFieldMapUrl({
                wellfield_id: self.Id
            }), ["image/jpeg", "image/png"], function (result) {
                self.WellFieldMaps.push(datacontext.createWellFieldMap(result[0], self));
            });
        };

        self.isOpenItem = ko.observable(false);

        self.toggleItem = function () {
            self.isOpenItem(!self.isOpenItem());
        };

        self.isSelectedItem = ko.computed(function () {
            return self === self.getWellRegion().selectedWellField();
        });

        self.afterRenderPartial = function () {
            // get all maps from this field
            self.getWellFieldMaps(function () {
                var arr = self.WellFieldMaps();
                if (arr.length > 0) {
                    arr[0].showWellFieldMap();
                }
            });

            self.initMapFileUpload();
        };

        self.selectItem = function () {
            self.isOpenItem(true);
            self.selectedWellFieldMap(null);

            self.getWellRegion().clearSetSelectedWellRegion();
            self.getWellRegion().selectedWellField(self);
        };

        self.getHashPath = function () {
            return '#region/' + self.getWellRegion().Id + '/field/' + self.Id;
        };

        self.addWellGroup = function () {
            var inputName = document.createElement('input');
            inputName.type = 'text';
            $(inputName).prop({ 'required': true }).addClass('form-control');

            var innerDiv = document.createElement('div');
            $(innerDiv).addClass('form-horizontal').append(
                bootstrapModal.gnrtDom('Name', inputName)
            );

            function submitFunction() {
                var wellGroupItem = datacontext.createWellGroup(
                    {
                        Name: $(inputName).val(),
                        WellFieldId: self.Id
                    }, self);

                datacontext.saveNewWellGroup(wellGroupItem).done(function (result) {
                    self.WellGroups.push(datacontext.createWellGroup(result, self));
                });

                bootstrapModal.closeModalWindow();
            }

            bootstrapModal.openModalWindow("Well group", innerDiv, submitFunction);
        };

        self.deleteWellGroup = function () {
            var wellGroupForDelete = this;
            if (confirm('Are you sure you want to delete "' + wellGroupForDelete.Name() + '"?')) {
                datacontext.deleteWellGroup(wellGroupForDelete).done(function () {
                    self.WellGroups.remove(wellGroupForDelete);
                });
            }
        };

        self.editWellField = function () {
            var inputName = document.createElement('input');
            inputName.type = 'text';
            $(inputName).val(self.Name()).prop({ 'required': true }).addClass('form-control');

            var innerDiv = document.createElement('div');
            $(innerDiv).addClass('form-horizontal').append(
                bootstrapModal.gnrtDom('Name', inputName)
            );

            bootstrapModal.openModalWindow("Well field", innerDiv, function () {
                self.Name($(inputName).val());
                datacontext.saveChangedWellField(self).done(function (result) { self.Name(result.Name); });
                bootstrapModal.closeModalWindow();
            });
        };

        self.toPlainJson = function () {
            var tmpPropList = ['Id', 'Name', 'WellRegionId'];
            var objReady = {};
            $.each(tmpPropList, function (propIndex, propValue) {
                // null can be sended to ovveride current value to null
                if (typeof ko.unwrap(self[propValue]) !== 'undefined') {
                    objReady[propValue] = ko.unwrap(self[propValue]);
                }
            });

            return objReady;
        };

        // load well groups
        self.WellGroups(importWellGroupsDto(data.WellGroupsDto, self));
    }

    datacontext.createWellField = function (data, wellRegionParent) {
        return new WellField(data, wellRegionParent);
    };
});