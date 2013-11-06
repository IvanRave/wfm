define(['jquery', 'knockout', 'app/datacontext'], function ($, ko, datacontext) {
    'use strict';

    function WfmParamSquad(data) {
        var self = this;
        data = data || {};

        self.id = data.Id;

        self.wfmParameterList = ko.observableArray();

        self.toPlainJson = function () { return ko.toJS(this); };

        // Set list of well file manager parameters to group (if exists)
        // Get requests for squads can be inclusive and non-inclusive: if inclusive then this list exists
        if (data.WfmParameterDtoList) {
            require(['app/models/wfm-parameter'], function () {
                function importWfmParameterDtoList(data) { return $.map(data || [], function (item) { return datacontext.createWfmParameter(item); }); }
                self.wfmParameterList(importWfmParameterDtoList(data.WfmParameterDtoList));
            });
        }
    }

    datacontext.createWfmParamSquad = function (data) {
        return new WfmParamSquad(data);
    };
});