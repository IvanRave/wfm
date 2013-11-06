define(['jquery',
    'knockout',
    'app/datacontext',
    'app/app-helper',
    'app/models/well-partials/perfomance-view',
    'moment',
    'app/models/ProductionData', // Add constructor to datacontext
    'app/models/ForecastEvolutionDto' // Add constructor to datacontext
], function ($, ko, datacontext, appHelper, perfomanceView, appMoment) {
    'use strict';

    // ProductionDataSet (convert data objects into array)
    function importProductionDataSetDto(data, parent) { return $.map(data || [], function (item) { return datacontext.createProductionData(item, parent); }); }

    function PerfomancePartial(wellObj) {

        var prtl = this;

        prtl.getWellObj = function () {
            return wellObj;
        };

        // History data
        prtl.hstProductionDataSet = ko.observableArray();

        prtl.isLoadedHstProductionData = ko.observable(false);

        prtl.prdColumnAttributeList = ko.observableArray();

        // namespace for graph
        prtl.prfGraph = {
            viewBox: {
                width: 1200,
                height: 400,
                ratio: 1 / 3
            },
            axisSize: 10
        };

        // ================================ FORECAST ===============================

        // forecast parameters to build graph
        prtl.forecastEvolution = datacontext.createForecastEvolution({ WellId: wellObj.Id });

        // forecast length
        prtl.forecastDayCount = ko.observable(3600); // 50 years = 18250 //3600

        // First element in history production data
        prtl.LastProductionData = ko.computed({
            read: function () {
                return ko.unwrap(prtl.hstProductionDataSet)[0];
            },
            deferEvaluation: true
        });

        // forecast panel with properties and evolutions and differences
        prtl.isVisibleForecastPanel = ko.observable(false);

        // TODO: Start
        // Evolutions
        prtl.DZADiffLiquid = ko.computed({
            read: function () {
                if (ko.unwrap(prtl.LastProductionData)) {
                    var cum = ko.unwrap(ko.unwrap(prtl.LastProductionData)['LiquidCum']);
                    if ($.isNumeric(cum)) {
                        var evoDict = ko.unwrap(ko.unwrap(prtl.forecastEvolution).Dict);
                        var evoLiquidA = ko.unwrap(evoDict['LiquidEvolutionA']),
                            evoLiquidB = ko.unwrap(evoDict['LiquidEvolutionB']);

                        if ($.isNumeric(evoLiquidA) === true && $.isNumeric(evoLiquidB) === true) {
                            return +evoLiquidA * Math.exp(+evoLiquidB * +cum);
                        }
                    }
                }
            },
            deferEvaluation: true
        });

        prtl.DZADiffLiquidResult = ko.computed({
            read: function () {
                var ddl = ko.unwrap(prtl.DZADiffLiquid);

                if ($.isNumeric(ddl)) {
                    var llr = ko.unwrap(ko.unwrap(prtl.LastProductionData)['LiquidRate']);
                    if ($.isNumeric(llr)) {
                        return +ddl - +llr;
                    }
                }
            },
            deferEvaluation: true
        });
        // DZA diff liquid END ===============================

        // DZA diff WaterCut =================================
        prtl.DZADiffWCT = ko.computed({
            read: function () {
                if (ko.unwrap(prtl.LastProductionData)) {
                    var cum = ko.unwrap(ko.unwrap(prtl.LastProductionData)['OilCum']);
                    if ($.isNumeric(cum)) {
                        var evoDict = ko.unwrap(ko.unwrap(prtl.forecastEvolution).Dict);
                        var evoWctC = ko.unwrap(evoDict['WctEvolutionC']),
                            evoWctD = ko.unwrap(evoDict['WctEvolutionD']);
                        if ($.isNumeric(evoWctC) && $.isNumeric(evoWctD)) {
                            return +evoWctC * Math.log(+cum) - +evoWctD;
                        }
                    }
                }
            },
            deferEvaluation: true
        });

        prtl.DZADiffWCTResult = ko.computed({
            read: function () {
                var ddw = ko.unwrap(prtl.DZADiffWCT);
                if ($.isNumeric(ddw)) {
                    var wct = ko.unwrap(ko.unwrap(prtl.LastProductionData)['WaterCut']);
                    if ($.isNumeric(wct)) {
                        return +ddw - (+wct);
                    }
                }
            },
            deferEvaluation: true
        });
        // DZA diff WaterCut END ================================

        // DZA diff GOR =========================================
        prtl.DZADiffGOR = ko.computed({
            read: function () {
                if (ko.unwrap(prtl.LastProductionData)) {
                    var cum = ko.unwrap(ko.unwrap(prtl.LastProductionData)['OilCum']);
                    if ($.isNumeric(cum)) {
                        var evoDict = ko.unwrap(ko.unwrap(prtl.forecastEvolution).Dict);
                        var evoGorF = ko.unwrap(evoDict['GorEvolutionF']),
                            evoGorG = ko.unwrap(evoDict['GorEvolutionG']);

                        if ($.isNumeric(evoGorF) && $.isNumeric(evoGorG)) {
                            return (+evoGorF) * Math.log(+cum) + (+evoGorG);
                        }
                    }
                }
            },
            deferEvaluation: true
        });

        prtl.DZADiffGORResult = ko.computed({
            read: function () {
                var ddg = ko.unwrap(prtl.DZADiffGOR);
                if ($.isNumeric(ddg)) {
                    var gor = ko.unwrap(ko.unwrap(prtl.LastProductionData)['GOR']);
                    if ($.isNumeric(gor)) {
                        return +ddg - +gor;
                    }
                }
            },
            deferEvaluation: true
        });
        // DZA diff GOR END ====================================

        // ============= Required forecast params list ===============================================

        prtl.requiredForecastParamListNaN = ko.computed({
            read: function () {
                var lastHistoryPD = ko.unwrap(prtl.LastProductionData);
                var requiredForecastParamList = ['OilCum', 'WaterCum', 'GasCum', 'LiquidRate', 'LiquidCum', 'GOR'];
                if (!lastHistoryPD) {
                    // if no last pd then need all params
                    return requiredForecastParamList;
                }

                return $.grep(requiredForecastParamList, function (arrElem) {
                    return $.isNumeric(ko.unwrap(lastHistoryPD[arrElem])) === false;
                });
            },
            deferEvaluation: true
        });

        prtl.requiredForecastParamListNaNString = ko.computed({
            read: function () {
                return ko.unwrap(prtl.requiredForecastParamListNaN).join(', ');
            },
            deferEvaluation: true
        });

        prtl.firstForecastPd = ko.computed({
            read: function () {
                var lastHistoryPD = ko.unwrap(prtl.LastProductionData);
                if (!lastHistoryPD) { return; }

                // if some required param is NaN then return
                if ((ko.unwrap(prtl.requiredForecastParamListNaN)).length > 0) { return; }

                if ((ko.unwrap(prtl.forecastEvolution.requiredForecastEvoListNaN)).length > 0) { return; }

                // all these parameters calculates from required params (check above requred params before checking these params)
                if ($.isNumeric(ko.unwrap(prtl.DZADiffLiquidResult)) === false) {
                    console.log('DZADiffLiquidResult is not number');
                    return;
                }

                if ($.isNumeric(ko.unwrap(prtl.DZADiffWCTResult)) === false) {
                    console.log('DZADiffWCTResult is not number');
                    return;
                }

                if ($.isNumeric(ko.unwrap(prtl.DZADiffGORResult)) === false) {
                    console.log('DZADiffGORResult is not number');
                    return;
                }

                var fddDict = {
                    OilCum: +ko.unwrap(lastHistoryPD.OilCum),
                    GasCum: +ko.unwrap(lastHistoryPD.GasCum),
                    WaterCum: +ko.unwrap(lastHistoryPD.WaterCum)
                };

                // Dictionary with forecast evolution parameters
                var evoDict = ko.unwrap(ko.unwrap(prtl.forecastEvolution).Dict);

                var evoLiquidA = +ko.unwrap(evoDict['LiquidEvolutionA']),
                    evoLiquidB = +ko.unwrap(evoDict['LiquidEvolutionB']),
                    evoWctC = +ko.unwrap(evoDict['WctEvolutionC']),
                    evoWctD = +ko.unwrap(evoDict['WctEvolutionD']),
                    evoGorF = +ko.unwrap(evoDict['GorEvolutionF']),
                    evoGorG = +ko.unwrap(evoDict['GorEvolutionG']);

                var diffLiquid = +ko.unwrap(prtl.DZADiffLiquidResult),
                    diffWct = +ko.unwrap(prtl.DZADiffWCTResult),
                    diffGor = +ko.unwrap(prtl.DZADiffGORResult);

                // calculated
                fddDict.LiquidCum = fddDict.OilCum + fddDict.WaterCum;
                fddDict.LiquidRate = evoLiquidA * Math.exp(evoLiquidB * fddDict.LiquidCum) - diffLiquid;
                fddDict.WaterCut = evoWctC * Math.log(fddDict.OilCum) - evoWctD - diffWct;
                fddDict.OilRate = (100 - fddDict.WaterCut) * fddDict.LiquidRate / 100;
                fddDict.WaterRate = fddDict.LiquidRate - fddDict.OilRate;
                fddDict.GOR = evoGorF * Math.log(fddDict.OilCum) + evoGorG - diffGor;
                fddDict.GasRate = fddDict.GOR * fddDict.OilRate;

                // first item in forecast - it's equals last actual production data by main parameters

                return datacontext.createProductionData({
                    WellId: +ko.unwrap(wellObj.Id),
                    UnixTime: +ko.unwrap(lastHistoryPD.unixTime),
                    ProdDays: +ko.unwrap(lastHistoryPD.ProdDays),
                    Dict: fddDict,
                    IsForecast: true
                }, wellObj);
            },
            deferEvaluation: true
        });

        prtl.startForecastUnixTime = ko.computed({
            read: function () {
                var tmpFirstForecastPd = ko.unwrap(prtl.firstForecastPd);
                if (tmpFirstForecastPd) {
                    return tmpFirstForecastPd.unixTime + tmpFirstForecastPd.ProdDays * 24 * 60 * 60;
                }
            },
            deferEvaluation: true
        });

        prtl.endForecastUnixTime = ko.computed({
            read: function () {
                if (ko.unwrap(prtl.startForecastUnixTime)) {
                    return ko.unwrap(prtl.startForecastUnixTime) + ko.unwrap(prtl.forecastDayCount) * 24 * 60 * 60;
                }
            },
            deferEvaluation: true
        });

        prtl.histYearList = ko.computed({
            read: function () {
                var yearList = [];

                var result = ko.unwrap(prtl.hstProductionDataSet);
                var rlength = result.length;
                if (rlength > 0) {
                    var startDate = new Date(ko.unwrap(result[rlength - 1].unixTime) * 1000);
                    var endDate = new Date(ko.unwrap(result[0].unixTime) * 1000);

                    // set available years

                    for (var i = endDate.getFullYear(), ilim = startDate.getFullYear() ; i >= ilim; i -= 1) {
                        yearList.push(i);
                    }

                    // Update according fields
                    // Can be updated after loading date or automatically by select boxes
                    ////prtl.WPDDateStartYear(yearList.length > 1 ? (endDate.getFullYear() - 1) : endDate.getFullYear());
                    ////prtl.WPDDateEndYear(endDate.getFullYear());
                }
                return yearList;
            },
            deferEvaluation: true
        });

        prtl.forecastYearList = ko.computed({
            read: function () {
                var resultYearList = [];

                var tmpStartForecastUnixTime = ko.unwrap(prtl.startForecastUnixTime);
                var tmpEndForecastUnixTime = ko.unwrap(prtl.endForecastUnixTime);

                if (tmpStartForecastUnixTime && tmpEndForecastUnixTime) {
                    resultYearList = appHelper.getYearList(new Date(tmpStartForecastUnixTime * 1000).getFullYear() + 1, new Date(tmpEndForecastUnixTime * 1000).getFullYear());
                }

                return resultYearList;
            },
            deferEvaluation: true
        });

        // All history data: without any filters
        // If need to update data then
        // 1. Set loaded to off
        // 2. Run method
        // Caution: when import new data through FileManager:
        // 1. set ProductionDataSet to []
        // 2. set isLoaded to false
        prtl.getHstProductionDataSet = function () {
            if (!ko.unwrap(prtl.isLoadedHstProductionData)) {
                datacontext.getProductionData({ well_id: wellObj.Id }).done(function (result) {
                    prtl.hstProductionDataSet(importProductionDataSetDto(result, wellObj));
                    prtl.isLoadedHstProductionData(true);
                });
            }
        };

        prtl.isForecastPossible = ko.computed({
            read: function () {
                return ko.unwrap(prtl.firstForecastPd) ? true : false;
            },
            deferEvaluation: true
        });

        prtl.dcaProductionDataSet = ko.computed({
            read: function () {
                var forecastArr = [];

                // set first elem in forecast collection
                var lastDca = ko.unwrap(prtl.firstForecastPd);

                // only if forecast possible
                if (lastDca) {
                    forecastArr.push(lastDca);

                    var startForecastUnixTime = +ko.unwrap(prtl.startForecastUnixTime);
                    var endForecastUnixTime = +ko.unwrap(prtl.endForecastUnixTime);

                    var evoDict = ko.unwrap(ko.unwrap(prtl.forecastEvolution).Dict);

                    var evoLiquidA = +ko.unwrap(evoDict['LiquidEvolutionA']),
                        evoLiquidB = +ko.unwrap(evoDict['LiquidEvolutionB']),
                        evoWctC = +ko.unwrap(evoDict['WctEvolutionC']),
                        evoWctD = +ko.unwrap(evoDict['WctEvolutionD']),
                        evoGorF = +ko.unwrap(evoDict['GorEvolutionF']),
                        evoGorG = +ko.unwrap(evoDict['GorEvolutionG']);

                    var diffLiquid = +ko.unwrap(prtl.DZADiffLiquidResult),
                        diffWct = +ko.unwrap(prtl.DZADiffWCTResult),
                        diffGor = +ko.unwrap(prtl.DZADiffGORResult);

                    var k = startForecastUnixTime;
                    while (k < endForecastUnixTime) {
                        // from OADate to daysInMonth
                        var daysInMonth = appMoment(k * 1000).daysInMonth();

                        var tmpDict = {};

                        tmpDict.LiquidRate = evoLiquidA * Math.exp(evoLiquidB * +ko.unwrap(lastDca.LiquidCum)) - diffLiquid;
                        tmpDict.WaterCut = evoWctC * Math.log(+ko.unwrap(lastDca.OilCum)) - evoWctD - diffWct;
                        tmpDict.OilRate = (100 - tmpDict.WaterCut) * tmpDict.LiquidRate / 100;
                        tmpDict.WaterRate = tmpDict.LiquidRate - tmpDict.OilRate;
                        tmpDict.OilCum = +ko.unwrap(lastDca.OilCum) + (daysInMonth * tmpDict.OilRate);
                        tmpDict.GOR = evoGorF * Math.log(tmpDict.OilCum) + evoGorG - diffGor;
                        tmpDict.GasRate = tmpDict.GOR * tmpDict.OilRate;
                        tmpDict.GasCum = +ko.unwrap(lastDca.GasCum) + tmpDict.GasRate * daysInMonth;
                        tmpDict.WaterCum = +ko.unwrap(lastDca.WaterCum) + tmpDict.WaterRate * daysInMonth;
                        tmpDict.LiquidCum = tmpDict.WaterCum + tmpDict.OilCum;

                        // set as last DCA
                        // decline curve analyze unit
                        lastDca = datacontext.createProductionData({
                            UnixTime: k,
                            ProdDays: daysInMonth, // or 30.5 as standart
                            Dict: tmpDict,
                            IsForecast: true
                        }, wellObj);

                        forecastArr.unshift(lastDca);

                        // add one month
                        k += daysInMonth * 24 * 60 * 60;
                    }
                }

                return forecastArr;
            },
            deferEvaluation: true
        });

        prtl.deleteWellProductionData = function () {
            if (confirm('Are you sure you want to delete all production data from well?')) {
                datacontext.deleteWellProductionData(wellObj.Id).done(function () {
                    prtl.hstProductionDataSet([]);
                    prtl.isLoadedHstProductionData(false);
                });
            }
        };

        prtl.createPerfomanceView = function (optns) {
            return perfomanceView.init(optns, prtl);
        };

        return prtl;
    }

    return {
        init: function (wellObj) { return new PerfomancePartial(wellObj); }
    };
});