define(['jquery', 'knockout', 'app/datacontext', 'bootstrap-modal', 'moment', 'app/app-helper', 'app/models/WellHistoryFile', 'app/models/wfm-image'],
    function ($, ko, datacontext, bootstrapModal, appMoment, appHelper) {
        'use strict';

        // convert data objects into array
        function importWellHistoryFiles(data) { return $.map(data || [], function (item) { return datacontext.createWellHistoryFile(item); }); }

        function importWfmImagesDto(data) { return $.map(data || [], function (item) { return datacontext.createWfmImage(item); }); }

        function WellHistory(data, well) {
            var self = this;
            data = data || {};

            self.getWell = function () {
                return well;
            };

            self.Id = data.Id;
            self.History = ko.observable(data.History);
            self.StartDate = ko.observable(data.StartDate);
            self.EndDate = ko.observable(data.EndDate);
            self.WellId = data.WellId;
            self.WfmImages = ko.observableArray();

            self.WellHistoryFiles = ko.observableArray(importWellHistoryFiles(data.WellHistoryFiles));

            self.editWellHistory = function () {
                var inputHistory = document.createElement('textarea');
                $(inputHistory).prop({ 'rows': 5 }).val(self.History()).addClass('form-control');

                var datePattern = '(?:19|20)[0-9]{2}-(?:(?:0[1-9]|1[0-2])-(?:0[1-9]|1[0-9]|2[0-9])|(?:(?!02)(?:0[1-9]|1[0-2])-(?:30))|(?:(?:0[13578]|1[02])-31))';

                var inputStartDate = document.createElement('input');
                inputStartDate.type = 'text';
                $(inputStartDate).prop({
                    'required': true,
                    'placeholder': 'yyyy-mm-dd',
                    'pattern': datePattern,
                    'title': 'Date format: yyyy-mm-dd (year, month, day)'
                }).val(appMoment(self.StartDate()).format('YYYY-MM-DD')).addClass('datepicker');

                var inputEndDate = document.createElement('input');
                inputEndDate.type = 'text';
                $(inputEndDate).prop({
                    'placeholder': 'yyyy-mm-dd (not necessary)',
                    'pattern': datePattern,
                    'title': 'Date format: yyyy-mm-dd (year, month, day)'
                })
                    .val(self.EndDate() ? appMoment(self.EndDate()).format('YYYY-MM-DD') : '')
                    .addClass('datepicker');

                var innerDiv = document.createElement('div');
                $(innerDiv).addClass('form-horizontal').append(
                    bootstrapModal.gnrtDom('Start date', inputStartDate),
                    bootstrapModal.gnrtDom('End date', inputEndDate),
                    bootstrapModal.gnrtDom('History', inputHistory)
                );

                function submitFunction() {
                    self.History($(inputHistory).val());
                    self.StartDate($(inputStartDate).val());
                    self.EndDate($(inputEndDate).val() || $(inputStartDate).val());
                    datacontext.saveChangedWellHistory(self).done(function (result) {
                        self.History(result.History);
                        self.StartDate(result.StartDate);
                        self.EndDate(result.EndDate);
                    });
                    bootstrapModal.closeModalWindow();
                }

                bootstrapModal.openModalWindow("Well history", innerDiv, submitFunction);
            };

            self.deleteWfmImage = function () {
                var itemForDelete = this;
                if (confirm('Are you sure you want to delete "' + itemForDelete.Name + '"?')) {
                    datacontext.deleteWfmImage(itemForDelete).done(function () {
                        self.WfmImages.remove(itemForDelete);
                    });
                }
            };

            self.deleteWellHistoryFile = function () {
                var itemForDelete = this;
                if (confirm('Are you sure you want to delete this file?')) {
                    datacontext.deleteWellHistoryFile(itemForDelete).done(function () {
                        self.WellHistoryFiles.remove(itemForDelete);
                    });
                }
            };

            self.chooseWellHistoryFile = function () {
                var existingFileNames = $.map(self.WellHistoryFiles(), function (whValue) {
                    var partUrlArray = whValue.CloudFileUrl.split('/');
                    return partUrlArray[partUrlArray.length - 1];
                });

                self.getWell().selectedFmgSectionId('history');

                function callbackFunction(checkedWellFileList) {
                    $.each(checkedWellFileList, function (elemIndex, elemValue) {
                        // if the selected file has not been added earlier, then add to well history files
                        if ($.inArray(elemValue.Name(), existingFileNames) === -1) {
                            var itemForAdd = datacontext.createWellHistoryFile({
                                WellHistoryId: self.Id,
                                Comment: '',
                                CloudFileUrl: self.WellId + '/history/work/' + elemValue.Name()
                            });

                            datacontext.saveNewWellHistoryFile(itemForAdd).done(function (response) {
                                self.WellHistoryFiles.push(datacontext.createWellHistoryFile(response));
                            });
                        }
                    });

                    bootstrapModal.closeModalWideWindow();
                }

                self.getWell().showFmg(callbackFunction);
            };

            self.chooseWfmImage = function () {
                self.getWell().selectedFmgSectionId('history');
                function callbackFunction(checkedWellFileList) {
                    if (checkedWellFileList.length !== 1) {
                        alert('Need to select one image');
                        return;
                    }

                    var checkedFile = checkedWellFileList[0];
                    if ($.inArray(checkedFile.ContentType, datacontext.imageMimeTypes) === -1) {
                        alert('Need to select image file: ' + datacontext.imageMimeTypes.join(', '));
                        return;
                    }

                    bootstrapModal.closeModalWideWindow();

                    var urlQueryParams = {
                        well_id: self.WellId,
                        purpose: 'history',
                        status: 'work',
                        file_name: checkedFile.Name()
                    };

                    // history image src
                    var path = datacontext.getWellFileUrl(urlQueryParams);
                    var innerDiv = document.createElement('div');
                    var historyImgElem = document.createElement('img');
                    innerDiv.appendChild(historyImgElem);
                    appHelper.toggleLoadingState(true);
                    // load image before open window and set JCrop
                    historyImgElem.onload = function () {
                        // load need libraries for cropping
                        require(['jquery.jcrop'], function () {

                            var coords = [0, 0, 0, 0];

                            function jcropSaveCoords(c) {
                                coords = [c.x, c.y, c.x2, c.y2];
                            }

                            // The variable jcrop_api will hold a reference to the Jcrop API once Jcrop is instantiated
                            $(historyImgElem).Jcrop({
                                onChange: jcropSaveCoords,
                                onSelect: jcropSaveCoords,
                                bgOpacity: 0.6
                            });

                            appHelper.toggleLoadingState(false);
                            // submitted by OK button
                            bootstrapModal.openModalWideWindow(innerDiv, function () {
                                ////var url = path + '&crop=(' + coords[0] + ',' + coords[1] + ',' + coords[2] + ',' + coords[3] + ')';
                                // check not null comments = if user can't choose whole images
                                // create wfmimage
                                var wfmImageReady = datacontext.createWfmImage({
                                    X1: coords[0],
                                    X2: coords[2],
                                    Y1: coords[1],
                                    Y2: coords[3],
                                    // full name (well_id + purpose + status + sdf
                                    // 71/history/work/fid20130211042811196_WellHistory.png
                                    Name: [urlQueryParams.well_id, urlQueryParams.purpose, urlQueryParams.status, urlQueryParams.file_name].join('/')
                                });

                                // send coords to database = save in wfmimage
                                datacontext.saveNewWfmImage({ wellhistory_id: self.Id }, wfmImageReady).done(function (saveResult) {
                                    // add images to dom with src
                                    self.WfmImages.push(datacontext.createWfmImage(saveResult));
                                    // push to wellhistory wfmimages
                                });

                                bootstrapModal.closeModalWideWindow();
                            });
                            // end of require
                        });
                    };

                    // start load image
                    historyImgElem.src = path;
                }

                self.getWell().showFmg(callbackFunction);
            };

            self.toPlainJson = function () { return ko.toJS(self); };

            self.WfmImages(importWfmImagesDto(data.WfmImagesDto));
        }

        datacontext.createWellHistory = function (item, wellParent) {
            return new WellHistory(item, wellParent);
        };
    });