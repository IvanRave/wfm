define(['jquery', 'knockout', 'app/datacontext', 'moment'], function ($, ko, datacontext, appMoment) {
    'use strict';

    var calcParamIdList = ['LiquidRate', 'WaterRate', 'OilCum', 'WaterCum', 'LiquidCum', 'GasCum', 'GOR'];

    function getCalcValue(prmId, prfItem) {
        if (prmId === 'LiquidRate') {
            var tmpOilRate = ko.unwrap(prfItem['OilRate']);
            var tmpWaterRate = ko.unwrap(prfItem['WaterRate']);

            if ($.isNumeric(tmpOilRate) === false) { return { error: { msg: 'required as a number', param: 'OilRate', mainParam: 'LiquidRate' } }; }
            if ($.isNumeric(tmpWaterRate) === false) { return { error: { msg: 'required as a number', param: 'WaterRate', mainParam: 'LiquidRate' } }; }

            return { response: tmpOilRate + tmpWaterRate };
        }
        else if (prmId === 'WaterRate') {
            var tmpLiquidRate = ko.unwrap(prfItem['LiquidRate']);
            var tmpWaterCut = ko.unwrap(prfItem['WaterCut']);
            if ($.isNumeric(tmpLiquidRate) === false) { return { error: { msg: 'required as a number', param: 'LiquidRate', mainParam: 'WaterRate' } }; }
            if ($.isNumeric(tmpWaterCut) === false) { return { error: { msg: 'required as a number', param: 'WaterCut', mainParam: 'WaterRate' } }; }

            return { response: tmpLiquidRate * (tmpWaterCut / 100) };
        }
        else if (prmId === 'GOR') {
            var gorGasRate = ko.unwrap(prfItem['GasRate']);
            var gorOilRate = ko.unwrap(prfItem['OilRate']);

            if ($.isNumeric(gorGasRate) === false) { return { error: { msg: 'required as a number', param: 'GasRate', mainParam: 'GOR' } }; }
            if ($.isNumeric(gorOilRate) === false) { return { error: { msg: 'required as a number', param: 'OilRate', mainParam: 'GOR' } }; }
            if (gorOilRate === 0) { return { error: { msg: 'can not be 0', param: 'OilRate', mainParam: 'GOR' } }; }

            return { response: gorGasRate / gorOilRate };
        }
        else if (prmId === 'OilCum' || prmId === 'WaterCum' || prmId === 'LiquidCum' || prmId === 'GasCum') {
            var accordRateId = prmId.replace("Cum", "Rate");
            var accordRateValue = ko.unwrap(prfItem[accordRateId]);
            if ($.isNumeric(accordRateValue) === false) { return { error: { msg: 'required as a number', param: accordRateId, mainParam: prmId } }; }

            var arr = ko.unwrap(prfItem.getWell().perfomancePartial.hstProductionDataSet);

            var cumSum = 0;
            for (var i = 0, imax = arr.length; i < imax; i += 1) {
                if (arr[i].unixTime <= prfItem.unixTime) {
                    cumSum += parseInt(arr[i].ProdDays, 10) * parseFloat(ko.unwrap(arr[i][accordRateId]));
                }
            }

            return { response: cumSum };
        }
    }

    function ProductionData(data, well) {
        var self = this;
        data = data || {};

        self.getWell = function () {
            return well;
        };

        // Unix time, or POSIX time, is a system for describing instances in time, 
        // defined as the number of seconds that have elapsed 
        // since 00:00:00 Coordinated Universal Time (UTC), 1 January 1970,
        // not counting leap seconds.
        self.unixTime = data.UnixTime;
        self.WellId = data.WellId;
        self.ProdDays = data.ProdDays;

        self.prfYear = new Date(self.unixTime * 1000).getFullYear();
        self.prfMonthStr = appMoment(self.unixTime * 1000).format('MMM');

        self.isSelectedPrfYear = ko.computed({
            read: function () {
                return ko.unwrap(self.getWell().mainPerfomanceView.selectedPrfTableYear) === self.prfYear;
            },
            deferEvaluation: true
        });

        // forecast data have no calculated properties, but you can construct forecast by last calculated row (other than last normal row)
        self.isForecast = data.IsForecast;

        for (var dictItem in data.Dict) {
            // if param is not calculated
            if ($.inArray(calcParamIdList, dictItem) === -1) {
                if ($.isNumeric(data.Dict[dictItem])) {
                    self[dictItem] = ko.observable(+data.Dict[dictItem]);
                }
                else {
                    alert('Production data parameter is not float [' + dictItem + ': ' + data.Dict[dictItem] + ']');
                }
            }
        }

        // calculated props
        $.each(calcParamIdList, function (prmIdIndex, prmId) {
            self[prmId] = ko.computed({
                read: function () {
                    //if (self.isForecast) { return; }
                    // Find from all params:
                    var needGroupParam = $.grep(ko.unwrap(self.getWell().getWellGroup().wellGroupWfmParameterList), function (arrElem) {
                        return arrElem.wfmParameterId === prmId;
                    })[0];

                    if (!needGroupParam) { return; }

                    if (needGroupParam.isCalc() === false) {
                        if (typeof data.Dict[prmId] !== 'undefined') {
                            if ($.isNumeric(data.Dict[prmId])) {
                                return +data.Dict[prmId];
                            }
                            else {
                                alert('Production data parameter is not float [' + prmId + ': ' + data.Dict[prmId] + ']');
                            }
                        }
                        return;
                    }
                    else {
                        var jpg = getCalcValue(prmId, self);

                        if (jpg.error) {
                            needGroupParam.isCalc(false);
                            console.log(needGroupParam.isCalc());
                            alert(jpg.error.mainParam + ' calculation: ' + jpg.error.param + ' ' + jpg.error.msg);
                            return;
                        }
                        else {
                            return jpg.response;
                        }
                    }
                },
                deferEvaluation: true
            });
        });

        self.toPlainJson = function () { return ko.toJS(self); };
    }

    datacontext.createProductionData = function (data, parent) {
        return new ProductionData(data, parent);
    };
});