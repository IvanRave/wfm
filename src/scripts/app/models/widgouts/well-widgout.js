define(['app/models/widgout'], function (widgout) {
    'use strict';

    // Well widget layout
    function WellWidgout(data, wellItem) {
        var self = this;
        data = data || {};

        self.wellId = wellItem.Id;

        self.getWell = function () {
            return wellItem;
        };

        widgout.call(self, data);

        console.log(self);
    }

    return WellWidgout;
});