define(['knockout', 'app/datacontext'], function (ko, datacontext) {
    'use strict';

    function CloudFile(data) {
        var self = this;
        data = data || {};

        self.Id = data.Id;
        self.Url = data.Url;

        self.toPlainJson = function () {
            return ko.toJS(self);
        };
    }

    datacontext.createCloudFile = function (item) {
        return new CloudFile(item);
    };
});