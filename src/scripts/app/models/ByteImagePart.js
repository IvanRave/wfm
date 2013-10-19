define(['app/datacontext'], function (datacontext) {
    'use strict';

    function ByteImagePart(data) {
        var self = this;
        data = data || {};

        self.base64String = data.Base64String;
        self.startY = data.StartY;

        self.toPlainJson = function () {
            return JSON.parse(JSON.stringify(self));
        };
    }

    datacontext.createByteImagePart = function (data) {
        return new ByteImagePart(data);
    };
});