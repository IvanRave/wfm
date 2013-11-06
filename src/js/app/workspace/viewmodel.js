define([
    'jquery',
    'knockout',
    'app/datacontext',
    'bootstrap-modal.min',
    'app/app-helper',
    'knockout-lazy',
    'app/models/WellRegion'
], function ($, ko, datacontext, bootstrapModal, appHelper) {
    'use strict';

    // get company Id
    var companyId = appHelper.queryString['cid'];

    // test company Id with Guid format (this checks retry server check in WorkSpace view of Home controller
    var regExpGuid = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
    if (regExpGuid.test(companyId) === false) {
        alert('Company id error');
        return;
    }

    var self = {
        isEditable: appHelper.queryString['editable'] === 'true' ? true : false,
        wellRegionList: ko.observableArray(),
        viewModelError: ko.observable(),
        selectedWellRegion: ko.observable(),
        curUserProfile: ko.observable(),
        isStructureLoaded: ko.observable(false),
        currentCompanyId: companyId,
        windowHeight: ko.observable($(window).height()),
        windowWidth: ko.observable($(window).width())
    };

    // =====================================Wfm parameters begin==========================================================
    function getWfmParamSquadList() {
        datacontext.getWfmParamSquadList({ is_inclusive: true }).done(function (r) {
            require(['app/models/wfm-param-squad'], function () {
                // WfmParamSquadList (convert data objects into array)
                function importWfmParamSquadList(data) {
                    return $.map(data || [], function (item) {
                        return datacontext.createWfmParamSquad(item);
                    });
                }

                self.wfmParamSquadList(importWfmParamSquadList(r));
            });
        });
    }

    self.wfmParamSquadList = ko.lazyObservableArray(getWfmParamSquadList, self);

    // Get all parameters from all groups as one dimensional array
    self.wfmParameterList = ko.computed({
        read: function () {
            return $.map(ko.unwrap(self.wfmParamSquadList), function (sqdElem) {
                return $.map(ko.unwrap(sqdElem.wfmParameterList), function (prmElem) {
                    return prmElem;
                });
            });
        },
        deferEvaluation: true
    });
    // =====================================Wfm parameters end==========================================================

    self.addWellRegion = function () {
        var self = this;

        var inputName = document.createElement('input');
        inputName.type = 'text';
        $(inputName).prop({ 'required': true }).addClass('form-control');

        var innerDiv = document.createElement('div');
        $(innerDiv).addClass('form-horizontal').append(
            bootstrapModal.gnrtDom('Name', inputName)
        );

        bootstrapModal.openModalWindow('Well region', innerDiv, function () {
            var wellRegionItem = datacontext.createWellRegion({
                Name: $(inputName).val(),
                CompanyId: companyId
            }, self);

            datacontext.saveNewWellRegion(wellRegionItem).done(function (result) {
                self.wellRegionList.push(datacontext.createWellRegion(result, self));
            });

            bootstrapModal.closeModalWindow();
        });
    };

    self.deleteWellRegion = function () {
        var wellRegionForDelete = this;
        if (wellRegionForDelete.WellFields().length > 0) {
            alert('Need to remove all well fields from this region.');
            return;
        }

        if (confirm('Are you sure you want to delete "' + wellRegionForDelete.Name() + '"?')) {
            datacontext.deleteWellRegion(wellRegionForDelete).done(function () {
                self.wellRegionList.remove(wellRegionForDelete);
            });
        }
    };

    function isValueInteger(checkedValue) {
        return (/^\d+$/).test(checkedValue);
    }

    function getChoosedIdFromHash() {
        var choosedObj = {
            regionId: null,
            fieldId: null,
            groupId: null,
            wellId: null,
            sectionId: null
        };

        var hashParamList = window.location.hash.substr(1).split('/');

        if (hashParamList[0] === 'region') {
            if (isValueInteger(hashParamList[1])) {
                choosedObj.regionId = parseInt(hashParamList[1]);

                if (hashParamList[2] === 'field') {
                    if (isValueInteger(hashParamList[3])) {
                        choosedObj.fieldId = parseInt(hashParamList[3]);

                        if (hashParamList[4] === 'group') {
                            if (isValueInteger(hashParamList[5])) {
                                choosedObj.groupId = parseInt(hashParamList[5]);

                                if (hashParamList[6] === 'well') {
                                    if (isValueInteger(hashParamList[7])) {
                                        choosedObj.wellId = parseInt(hashParamList[7]);

                                        if (hashParamList[8] === 'section') {
                                            choosedObj.sectionId = hashParamList[9];
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }

        return choosedObj;
    }

    // TODO: back after repair getUserProfile();    
    // TODO: move selectItem() logic to parent objects:
    // well.selectWell() => wellGroup.selectWell()

    /// <summary>
    /// Get element from list by property value: element with property [propName] equals [propValue]
    /// </summary>
    function getElementByPropertyValue(elemList, propName, propValue) {
        var needElemValue = null;

        if (propName) {
            $.each(elemList, function (elemIndex, elemValue) {
                if (elemValue[propName] === propValue) {
                    // Find elem
                    needElemValue = elemValue;
                    // Exit from this cycle
                    return false;
                }

                // Continue this cycle
                return true;
            });
        }

        return needElemValue;
    }

    // load list of well region, well field...
    function loadStructure() {
        function getSucceeded(data) {
            var mappedStructure = $.map(data, function (list) {
                return new datacontext.createWellRegion(list, self);
            });

            self.wellRegionList(mappedStructure);

            // route region/id/field/id/group/id/well/id
            var choosedObj = getChoosedIdFromHash();
            console.log(choosedObj);
            var tmpRegion = getElementByPropertyValue(self.wellRegionList(), 'Id', choosedObj.regionId);
            if (tmpRegion) {
                self.selectedWellRegion(tmpRegion);
                tmpRegion.isOpenItem(true);
                var tmpField = getElementByPropertyValue(self.selectedWellRegion().WellFields(), 'Id', choosedObj.fieldId);
                if (tmpField) {
                    self.selectedWellRegion().selectedWellField(tmpField);
                    tmpField.isOpenItem(true);
                    var tmpGroup = getElementByPropertyValue(self.selectedWellRegion().selectedWellField().WellGroups(), 'Id', choosedObj.groupId);
                    if (tmpGroup) {
                        self.selectedWellRegion().selectedWellField().selectedWellGroup(tmpGroup);
                        tmpGroup.isOpenItem(true);
                        var tmpWell = getElementByPropertyValue(self.selectedWellRegion().selectedWellField().selectedWellGroup().Wells(), 'Id', choosedObj.wellId);
                        if (tmpWell) {
                            self.selectedWellRegion().selectedWellField().selectedWellGroup().selectedWell(tmpWell);
                            tmpWell.isOpenItem(true);
                            // todo: change logic - when change selected id - need to execute additional logic
                            if (choosedObj.sectionId) {
                                tmpWell.selectedSectionId(choosedObj.sectionId);
                            }
                            // Apchive: previously - set summary as a default page
                            ////else {
                            ////    tmpWell.selectedSectionId(tmpWell.sectionList[0].id);
                            ////}

                            // this set selected well
                            ////console.log(self.selectedWellRegion().selectedWellField().selectedWellGroup().selectedWell());
                        }
                    }
                }
            }

            self.isStructureLoaded(true);
        }

        function getFailed() {
            self.viewModelError('Error retrieving lists.');
        }

        datacontext.getWellRegionList({
            company_id: companyId,
            is_inclusive: true
        }).done(getSucceeded).fail(getFailed);
    }

    loadStructure();

    return self;
});