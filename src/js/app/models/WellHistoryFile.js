define(['knockout', 'app/datacontext', 'app/app-helper'], function (ko, datacontext, appHelper) {
    'use strict';

    function WellHistoryFile(data) {
        var self = this;
        data = data || {};

        self.WellHistoryId = data.WellHistoryId;
        self.CloudFileId = data.CloudFileId;
        self.Comment = ko.observable(data.Comment);
        self.CloudFileUrl = data.CloudFileUrl;

        self.FileNameWODate = ko.computed(function () {
            var fileNameOnly = self.CloudFileUrl.split('/')[3];
            return fileNameOnly.substr(fileNameOnly.indexOf('_') + 1);
        });

        self.downloadWellHistoryFile = function () {
            var urlPartArray = self.CloudFileUrl.split('/');

            appHelper.downloadURL(datacontext.getWellFileUrl({
                well_id: urlPartArray[0],
                purpose: urlPartArray[1],
                status: urlPartArray[2],
                file_name: urlPartArray[3]
            }));
        };

        self.toPlainJson = function () { return ko.toJS(self); };
    }

    datacontext.createWellHistoryFile = function (data) {
        return new WellHistoryFile(data);
    };
});