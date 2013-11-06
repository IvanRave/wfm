define(['knockout', 'app/datacontext'], function (ko, datacontext) {
    'use strict';

    function WfmImage(data) {
        var self = this;
        data = data || {};

        self.Id = data.Id;
        self.Name = data.Name;
        self.X1 = data.X1;
        self.Y1 = data.Y1;
        self.X2 = data.X2;
        self.Y2 = data.Y2;
        self.CropXUnits = data.CropXUnits;
        self.CropYUnits = data.CropYUnits;

        self.dataUrl = data.DataUrl;

        self.ImgUrl = ko.computed(function () {
            // GetCropImage(int well_id, string purpose, string status, string file_name, string crop)
            var nameArray = self.Name.split('/');
            var urlQueryParams = {
                well_id: nameArray[0],
                purpose: nameArray[1],
                status: nameArray[2],
                file_name: nameArray[3],
                crop: '(' + [self.X1, self.Y1, self.X2, self.Y2].join(',') + ')'
            };

            return datacontext.getWellFileUrl(urlQueryParams);
            // divide name by slash
            // add coords
            // take wellfileurl with urlqueryparams
        });

        self.toPlainJson = function () { return ko.toJS(self); };
    }

    datacontext.createWfmImage = function (item) {
        return new WfmImage(item);
    };
});