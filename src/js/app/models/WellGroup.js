define(['jquery', 'knockout', 'app/datacontext', 'bootstrap-modal',
    'app/workspace/viewmodel',
    'app/models/Well', 'app/models/WellGroupWfmParameter'
], function ($, ko, datacontext, bootstrapModal) {
    'use strict';

    // 18. WellGroupWfmParameter
    function importWellGroupWfmParameterDtoList(data, wellGroupItem) { return $.map(data || [], function (item) { return datacontext.createWellGroupWfmParameter(item, wellGroupItem); }); }

    // 4. Wells (convert data objects into array)
    function importWellsDto(data, parent) { return $.map(data || [], function (item) { return datacontext.createWell(item, parent); }); }

    function WellGroup(data, wellField) {
        var self = this;
        data = data || {};

        self.getWellField = function () {
            return wellField;
        };

        // Persisted properties
        self.Id = data.Id;
        self.Name = ko.observable(data.Name);

        // Foreign key
        self.WellFieldId = data.WellFieldId;
        self.Wells = ko.observableArray();
        self.selectedWell = ko.observable();

        // Well file manager parameter for this group
        self.wellGroupWfmParameterList = ko.observableArray();

        self.isLoadWellGroupWfmParameterList = ko.observable(false);

        self.getWellGroupWfmParameterList = function () {
            if (ko.unwrap(self.isLoadWellGroupWfmParameterList) === false) {
                datacontext.getWellGroupWfmParameterList({ wellgroup_id: self.Id }).done(function (response) {
                    self.wellGroupWfmParameterList(importWellGroupWfmParameterDtoList(response));
                    self.isLoadWellGroupWfmParameterList(true);
                });
            }
        };

        var appViewModel = self.getWellField().getWellRegion().getParentViewModel();

        // wfm parameter from main source which is not in this group
        self.unselectedWfmParameterList = ko.computed({
            read: function () {
                // two arrays
                return $.grep(ko.unwrap(appViewModel.wfmParameterList), function (prmElem) {
                    var isParamExist = false;
                    $.each(ko.unwrap(self.wellGroupWfmParameterList), function (wlgIndex, wlgElem) {
                        if (wlgElem.wfmParameterId === prmElem.id) {
                            isParamExist = true;
                            // break from arr
                            return false;
                        }
                    });

                    // return params which are not selected in this well group
                    return !isParamExist;
                });
            },
            deferEvaluation: true
        });

        // WFM parameter which user select from unselected wfm parameter list (from root)
        self.selectedWfmParameterId = ko.observable();

        self.addWellGroupWfmParameter = function () {
            if (!self.selectedWfmParameterId()) { return; }

            // request to create wellGroupWfmParameter 
            var wellGroupWfmParameterNew = datacontext.createWellGroupWfmParameter({
                Color: "",
                SerialNumber: 1,
                WellGroupId: self.Id,
                WfmParameterId: self.selectedWfmParameterId()
            });

            datacontext.postWellGroupWfmParameter(wellGroupWfmParameterNew).done(function (response) {
                var createdWellGroupWfmParameter = datacontext.createWellGroupWfmParameter(response);
                self.wellGroupWfmParameterList.push(createdWellGroupWfmParameter);
            });
        };

        ////self.addWellGroupWfmParameter = function () {
        ////    var inputId = document.createElement("input");
        ////    inputId.type = "text";
        ////    $(inputId).prop({ pattern: "[a-zA-Z]+", title: "Only letters: a-z(A-Z)", required: true });

        ////    var inputName = document.createElement("input");
        ////    inputName.type = "text";
        ////    $(inputName).prop({ required: true });

        ////    var inputIsCumulative = document.createElement("input");
        ////    inputIsCumulative.type = "checkbox";

        ////    var innerDiv = document.createElement("div");
        ////    $(innerDiv).addClass("form-horizontal").append(
        ////        bootstrapModal.gnrtDom("Parameter id", inputId),
        ////        bootstrapModal.gnrtDom("Name", inputName),
        ////        bootstrapModal.gnrtDom("Is cumulative", inputIsCumulative)
        ////    );

        ////    function submitFunction() {
        ////        // request to create new wfmParameter
        ////        var wfmParameterNew = datacontext.createWfmParameter({
        ////            Id: $(inputId).val(),
        ////            Name: $(inputName).val(),
        ////            Uom: "",
        ////            DefaultColor: "",
        ////            IsCumulative: $(inputIsCumulative).prop("checked"),
        ////            IsSystem: false
        ////        });

        ////        datacontext.postWfmParameter(wfmParameterNew).done(function (wfmParameterResponse) {
        ////            var createdWfmParameter = datacontext.createWfmParameter(wfmParameterResponse);

        ////            // request to create wellGroupWfmParameter 
        ////            var wellGroupWfmParameterNew = datacontext.createWellGroupWfmParameter({
        ////                Color: "",
        ////                SerialNumber: 1,
        ////                WellGroupId: self.Id,
        ////                WfmParameterId: $(inputId).val()
        ////            });

        ////            datacontext.postWellGroupWfmParameter(wellGroupWfmParameterNew).done(function (response) {
        ////                var createdWellGroupWfmParameter = datacontext.createWellGroupWfmParameter(response);
        ////                createdWellGroupWfmParameter.wfmParameter = createdWfmParameter;
        ////                self.wellGroupWfmParameterList.push(createdWellGroupWfmParameter);
        ////            });
        ////            // or error - id is denied
        ////            // if one company get for itself purposes all ids, then will be errors frequently
        ////        });

        ////        bootstrapModal.closeModalWindow();
        ////    }

        ////    bootstrapModal.openModalWindow("Add parameter", innerDiv, submitFunction);
        ////};

        self.addWell = function () {
            var inputName = document.createElement('input');
            inputName.type = 'text';
            $(inputName).prop({ 'required': true }).addClass('form-control');

            var innerDiv = document.createElement('div');
            $(innerDiv).addClass('form-horizontal').append(
                bootstrapModal.gnrtDom('Name', inputName)
            );

            function submitFunction() {
                var wellItem = datacontext.createWell({
                    Name: $(inputName).val(),
                    WellGroupId: self.Id
                }, self);

                datacontext.saveNewWell(wellItem).done(function (result) {
                    self.Wells.push(datacontext.createWell(result, self));
                });

                bootstrapModal.closeModalWindow();
            }

            bootstrapModal.openModalWindow("Well", innerDiv, submitFunction);
        };

        self.deleteWell = function () {
            var wellForDelete = this;
            if (confirm('Are you sure you want to delete "' + wellForDelete.Name() + '"?')) {
                datacontext.deleteWell(wellForDelete).done(function () {
                    self.Wells.remove(wellForDelete);
                });
            }
        };

        self.editWellGroup = function () {
            var inputName = document.createElement('input');
            inputName.type = 'text';
            $(inputName).val(self.Name()).prop({ 'required': true }).addClass('form-control');

            var innerDiv = document.createElement('div');
            $(innerDiv).addClass('form-horizontal').append(
                bootstrapModal.gnrtDom('Name', inputName)
            );

            function submitFunction() {
                self.Name($(inputName).val());
                datacontext.saveChangedWellGroup(self).done(function (result) { self.Name(result.Name); });
                bootstrapModal.closeModalWindow();
            }

            bootstrapModal.openModalWindow("Well group", innerDiv, submitFunction);
        };

        self.getHashPath = function () {
            var tmpField = self.getWellField();
            var tmpRegion = tmpField.getWellRegion();
            return '#region/' + tmpRegion.Id + '/field/' + tmpField.Id + '/group/' + self.Id;
        };

        self.isOpenItem = ko.observable(false);

        self.toggleItem = function () {
            self.isOpenItem(!self.isOpenItem());
        };

        self.isSelectedItem = ko.computed(function () {
            return self === self.getWellField().selectedWellGroup();
        });

        self.afterRenderPartial = function () {
            // get last approved scopes of every well (one request)
            // insert in every well
            // get all test data for every with total

            var wellIdList = self.Wells().map(function (el) {
                return el.Id;
            });

            if (wellIdList.length === 0) { return; }

            self.getWellGroupWfmParameterList();

            datacontext.getTestScope({ wellIdList: wellIdList }).done(function (result) {
                console.log(result);
                if (result.length === 0) { return; }
                //for (var w = 0, wMax = self.Wells().length; w < wMax; w++) {
                $.each(self.Wells(), function (wellIndex, wellValue) {
                    //for (var i = 0, iMax = objSet.length; i < iMax; i++) {
                    $.each(result, function (objIndex, objValue) {
                        if (wellValue.Id === objValue.WellId) {
                            wellValue.lastTestScope(datacontext.createTestScope(objValue, wellValue));
                            return false;
                        }
                    });
                });
            });
        };

        self.selectItem = function () {
            self.isOpenItem(true);
            var parentWellRegion = self.getWellField().getWellRegion();
            parentWellRegion.clearSetSelectedWellRegion();
            parentWellRegion.selectedWellField(self.getWellField());
            parentWellRegion.selectedWellField().selectedWellGroup(self);            
        };

        self.toPlainJson = function () {
            ////var copy = ko.toJS(self);
            var tmpPropList = ['Id', 'Name', 'WellFieldId'];
            var objReady = {};
            $.each(tmpPropList, function (propIndex, propValue) {
                // null can be sended to ovveride current value to null
                if (typeof ko.unwrap(self[propValue]) !== 'undefined') {
                    objReady[propValue] = ko.unwrap(self[propValue]);
                }
            });

            return objReady;
        };

        // load wells
        self.Wells(importWellsDto(data.WellsDto, self));
    }

    datacontext.createWellGroup = function (data, parent) {
        return new WellGroup(data, parent);
    };
});