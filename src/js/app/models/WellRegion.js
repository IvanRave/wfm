define(['jquery', 'knockout', 'app/datacontext', 'bootstrap-modal', 'app/models/WellField'], function ($, ko, datacontext, bootstrapModal) {
    'use strict';

    // 2. WellField (convert data objects into array)
    function importWellFieldsDto(data, parent) { return $.map(data || [], function (item) { return datacontext.createWellField(item, parent); }); }

    function WellRegion(data, parentViewModel) {
        var self = this;
        data = data || {};

        // Persisted properties
        self.Id = data.Id;
        self.CompanyId = data.CompanyId;
        self.Name = ko.observable(data.Name);
        self.WellFields = ko.observableArray();

        self.getParentViewModel = function () {
            return parentViewModel;
        };

        self.isOpenItem = ko.observable(false);

        // toggle item - only open menu tree (show inner object without content)
        self.toggleItem = function () {
            self.isOpenItem(!self.isOpenItem());
        };

        self.isSelectedItem = ko.computed(function () {
            return (self === self.getParentViewModel().selectedWellRegion());
        });

        self.selectedWellField = ko.observable();

        // well.selectedGroup.selectedField.selectedRegion.clear() instead every prop
        self.clearSetSelectedWellRegion = function () {
            self.getParentViewModel().selectedWellRegion(null);
            var slcWellField = self.selectedWellField;
            if (slcWellField()) {
                var slcWellGroup = slcWellField().selectedWellGroup;
                if (slcWellGroup()) {
                    var slcWell = slcWellGroup().selectedWell;
                    if (slcWell()) {
                        var slcSectionId = slcWell().selectedSectionId;
                        if (slcSectionId()) {
                            slcSectionId(null);
                        }
                        slcWell(null);
                    }
                    slcWellGroup(null);
                }
                slcWellField(null);
            }

            self.getParentViewModel().selectedWellRegion(self);
        };

        // select menu - open menu and show content
        self.selectItem = function () {
            // set to null all children
            self.isOpenItem(true);
            self.clearSetSelectedWellRegion();
        };

        self.getHashPath = function () {
            return '#region/' + self.Id;
        };

        self.deleteWellField = function () {
            var wellFieldForDelete = this;
            if (confirm('Are you sure you want to delete "' + wellFieldForDelete.Name() + '"?')) {
                datacontext.deleteWellField(wellFieldForDelete.Id).done(function () {
                    self.WellFields.remove(wellFieldForDelete);
                });
            }
        };

        self.editWellRegion = function () {
            var inputName = document.createElement('input');
            inputName.type = 'text';
            $(inputName).val(self.Name()).prop({ 'required': true }).addClass('form-control');

            var innerDiv = document.createElement('div');
            $(innerDiv).addClass('form-horizontal').append(
                bootstrapModal.gnrtDom('Name', inputName)
            );

            bootstrapModal.openModalWindow("Well region", innerDiv, function () {
                self.Name($(inputName).val());
                datacontext.saveChangedWellRegion(self).done(function (result) { self.Name(result.Name); });
                bootstrapModal.closeModalWindow();
            });
        };

        /// <summary>
        /// Convert model to plain json object without unnecessary properties. Can be used to send requests (with clean object) to the server
        /// </summary>
        /// <remarks>
        /// http://knockoutjs.com/documentation/json-data.html
        /// "ko.toJS — this clones your view model’s object graph, substituting for each observable the current value of that observable, 
        /// so you get a plain copy that contains only your data and no Knockout-related artifacts"
        /// </remarks>
        self.toPlainJson = function () {
            ////var copy = ko.toJS(self);
            var tmpPropList = ['Id', 'CompanyId', 'Name'];
            
            var objReady = {};
            $.each(tmpPropList, function (propIndex, propValue) {
                // null can be sended to ovveride current value to null
                if (typeof ko.unwrap(self[propValue]) !== 'undefined') {
                    objReady[propValue] = ko.unwrap(self[propValue]);
                }
            });
            
            return objReady;
        };

        // load well fields
        self.WellFields(importWellFieldsDto(data.WellFieldsDto, self));
    }

    WellRegion.prototype.addWellField = function () {
        var parentItem = this;

        var inputName = document.createElement('input');
        inputName.type = 'text';
        $(inputName).prop({ 'required': true }).addClass('form-control');

        var innerDiv = document.createElement('div');

        $(innerDiv).addClass('form-horizontal').append(
            bootstrapModal.gnrtDom('Name', inputName)
        );

        function submitFunction() {
            var wellFieldItem = datacontext.createWellField({
                Name: $(inputName).val(),
                WellRegionId: parentItem.Id
            }, parentItem);

            datacontext.saveNewWellField(wellFieldItem).done(function (result) {
                parentItem.WellFields.push(datacontext.createWellField(result, parentItem));
            });

            bootstrapModal.closeModalWindow();
        }

        bootstrapModal.openModalWindow("Well field", innerDiv, submitFunction);
    };

    datacontext.createWellRegion = function (data, parentViewModel) {
        return new WellRegion(data, parentViewModel);
    };
});