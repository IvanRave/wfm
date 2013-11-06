define(['knockout', 'app/datacontext', 'app/models/wfm-parameter'], function (ko, datacontext) {
    'use strict';

    // Every well group has own array of wfm parameters
    function WellGroupWfmParameter(data, wellGroupItem) {
        var self = this;
        data = data || {};
        self.toPlainJson = function () { return ko.toJS(self); };

        self.getWellGroup = function () {
            return wellGroupItem;
        };

        self.wellGroupId = data.WellGroupId;
        self.wfmParameterId = data.WfmParameterId;
        self.serialNumber = ko.observable(data.SerialNumber);
        // if user wants to change default color (from wfmParameter)
        self.color = ko.observable(data.Color);

        // Can be load from cookies
        self.isVisible = ko.observable(true);
        
        // Is calculated parameter?
        self.isCalc = ko.observable(false);

        self.wfmParameter = ko.observable();

        // When create temp parameter for POST request - this data is not exists
        if (data.WfmParameterDto) {
            self.wfmParameter(datacontext.createWfmParameter(data.WfmParameterDto));

            // If no color then use default color from wfm parameter
            if (!self.color()) {
                self.color(self.wfmParameter().defaultColor());
            }
        }
    }

    datacontext.createWellGroupWfmParameter = function (data, wellGroupItem) {
        return new WellGroupWfmParameter(data, wellGroupItem);
    };
});