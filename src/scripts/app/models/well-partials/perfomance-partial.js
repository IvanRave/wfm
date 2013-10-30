define(['jquery',
    'ko',
    'd3',
    'app/datacontext',
    'app/app-helper',
    'app/models/ProductionData', // Add constructor to datacontext
    'app/models/ForecastEvolutionDto' // Add constructor to datacontext
], function ($, ko, d3, datacontext, appHelper) {
    'use strict';

    // ProductionDataSet (convert data objects into array)
    function importProductionDataSetDto(data, parent) { return $.map(data || [], function (item) { return datacontext.createProductionData(item, parent); }); }

    function PerfomancePartial(wellObj) {

        var prtl = this;

        // History data
        prtl.hstProductionDataSet = ko.observableArray();

        prtl.isLoadedHstProductionData = ko.observable(false);

        prtl.isVisibleForecastData = ko.observable(false);

        prtl.selectedPrfTableYear = ko.observable();
        prtl.selectPrfTableYear = function (selectedPrfTableYearItem) {
            prtl.selectedPrfTableYear(selectedPrfTableYearItem);
        };

        prtl.monthList = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

        prtl.WPDDateStartYear = ko.observable();
        prtl.WPDDateEndYear = ko.observable();
        prtl.WPDDateStartMonth = ko.observable(1);
        prtl.WPDDateEndMonth = ko.observable(12);

        function updateSelectedPrfTableYear() {
            var tmpWpdDateStartYear = ko.unwrap(prtl.WPDDateStartYear),
                tmpWpdDateEndYear = ko.unwrap(prtl.WPDDateEndYear),
                tmpSelectedPrfTableYear = ko.unwrap(prtl.selectedPrfTableYear);

            if (tmpWpdDateStartYear && tmpWpdDateEndYear) {
                if (!tmpSelectedPrfTableYear || tmpSelectedPrfTableYear < tmpWpdDateStartYear || tmpSelectedPrfTableYear > tmpWpdDateEndYear) {
                    prtl.selectedPrfTableYear(tmpWpdDateStartYear);
                }
            }
        }

        prtl.WPDDateStartYear.subscribe(updateSelectedPrfTableYear);
        prtl.WPDDateEndYear.subscribe(updateSelectedPrfTableYear);

        prtl.prdColumnAttributeList = ko.observableArray();

        prtl.selectedAttrGroup = ko.observable();

        // Well group parameters for selected squad
        prtl.selectedWellGroupWfmParameterList = ko.computed({
            read: function () {
                if (!ko.unwrap(prtl.selectedAttrGroup)) { return []; }

                // list of wg parameters for this well group
                var tmpWellGroupWfmParameterList = ko.unwrap(wellObj.getWellGroup().wellGroupWfmParameterList);

                // list of parameter for selected squad
                var tmpSelectedWfmParameterList = ko.unwrap(ko.unwrap(prtl.selectedAttrGroup).wfmParameterList);

                // Select only parameter ids
                var tmpSelectedWfmParameterIdList = $.map(tmpSelectedWfmParameterList, function (ssgElem) {
                    return ssgElem.id;
                });

                // return only well group wfm parameters in selected squad
                return $.grep(tmpWellGroupWfmParameterList, function (wgpElem) {
                    return $.inArray(wgpElem.wfmParameterId, tmpSelectedWfmParameterIdList) >= 0;
                });
            },
            deferEvaluation: true
        });

        prtl.filteredByDateProductionDataSet = ko.computed({
            read: function () {
                var resultArr = [];

                if (ko.unwrap(prtl.WPDDateStartYear) && ko.unwrap(prtl.WPDDateEndYear)) {
                    // Seconds from Unix Epoch
                    var startUnixTime = new Date(Date.UTC(ko.unwrap(prtl.WPDDateStartYear), ko.unwrap(prtl.WPDDateStartMonth) - 1, 1)).getTime() / 1000;
                    var endUnixTime = new Date(Date.UTC(ko.unwrap(prtl.WPDDateEndYear), ko.unwrap(prtl.WPDDateEndMonth) - 1, 1)).getTime() / 1000;

                    var prdArray;
                    if (ko.unwrap(prtl.isVisibleForecastData) === true) {
                        prdArray = ko.unwrap(prtl.dcaProductionDataSet).concat(ko.unwrap(prtl.hstProductionDataSet));
                    }
                    else {
                        prdArray = ko.unwrap(prtl.hstProductionDataSet);
                    }

                    resultArr = ko.utils.arrayFilter(prdArray, function (r) {
                        return ((r.unixTime >= startUnixTime) && (r.unixTime <= endUnixTime));
                    });
                }

                return resultArr;
            },
            deferEvaluation: true
        });

        // Real time border: min and max values in unix time format
        // This time border other than WPDDateStartYear, EndYear (ant other selectable values)
        prtl.filteredByDateProductionDataSetTimeBorder = ko.computed({
            read: function () {
                var arr = ko.unwrap(prtl.filteredByDateProductionDataSet);
                if (arr.length === 0) { return []; }

                return [arr[arr.length - 1].unixTime, arr[0].unixTime];
            },
            deferEvaluation: true
        });

        // Real value border: min and max values of data in selected squad
        prtl.filteredByDateProductionDataSetValueBorder = ko.computed({
            read: function () {
                // get max and min value to find coef for graph
                var minValue, maxValue;

                $.each(ko.unwrap(prtl.filteredByDateProductionDataSet), function (prfIndex, prfElem) {
                    $.each(ko.unwrap(prtl.selectedWellGroupWfmParameterList), function (clmIndex, clmElem) {
                        if (ko.unwrap(clmElem.isVisible)) {
                            if ($.isNumeric(ko.unwrap(prfElem[clmElem.wfmParameterId]))) {
                                var tmpValue = ko.unwrap(prfElem[clmElem.wfmParameterId]) * ko.unwrap(clmElem.wfmParameter().uomCoef);
                                // init first values
                                if (typeof minValue === 'undefined' || typeof maxValue === 'undefined') {
                                    minValue = maxValue = tmpValue;
                                }
                                else {
                                    if (tmpValue > maxValue) { maxValue = tmpValue; }
                                    else if (tmpValue < minValue) { minValue = tmpValue; }
                                }
                            }
                        }
                    });
                });
                // Still can be undefined
                return [minValue, maxValue];
            },
            deferEvaluation: true
        });

        // namespace for graph
        prtl.prfGraph = {
            viewBox: {
                width: 1200,
                height: 400,
                ratio: 1 / 3
            },
            axisSize: 10
        };

        // actual height of graph ang y-axis
        prtl.prfGraphHeight = ko.observable();

        // Update perfomance graph data: graph path for selected regions
        prtl.productionDataSetSvgPath = ko.computed(function () {
            var columnPathJson = {};

            var tmpSelectedWellGroupWfmParameterList = ko.unwrap(prtl.selectedWellGroupWfmParameterList),
                tmpFilteredByDateProductionDataSet = ko.unwrap(prtl.filteredByDateProductionDataSet);

            // Check parameter and data existence
            if (tmpSelectedWellGroupWfmParameterList.length > 0 &&
                tmpFilteredByDateProductionDataSet.length > 0 &&
                $.isNumeric(ko.unwrap(prtl.filteredByDateProductionDataSetValueBorder)[0]) &&
                $.isNumeric(ko.unwrap(prtl.filteredByDateProductionDataSetValueBorder)[1]) &&
                $.isNumeric(ko.unwrap(prtl.filteredByDateProductionDataSetTimeBorder)[0]) &&
                $.isNumeric(ko.unwrap(prtl.filteredByDateProductionDataSetTimeBorder)[1])) {

                //require(['d3'], function (d3) {
                var x = d3.time.scale().range([0, prtl.prfGraph.viewBox.width]),
                    y = d3.scale.linear().range([prtl.prfGraph.viewBox.height, 0]);

                var line = d3.svg.line()
                    .interpolate('linear')
                    ////monotone
                    .x(function (d) { return x(new Date(d.unixTime * 1000)); });

                x.domain([new Date(ko.unwrap(prtl.filteredByDateProductionDataSetTimeBorder)[0] * 1000), new Date(ko.unwrap(prtl.filteredByDateProductionDataSetTimeBorder)[1] * 1000)]);
                y.domain(ko.unwrap(prtl.filteredByDateProductionDataSetValueBorder));

                $.each(tmpSelectedWellGroupWfmParameterList, function (paramIndex, paramElem) {
                    if (ko.unwrap(paramElem.isVisible) === true) {
                        line.y(function (d) {
                            return y(
                                $.isNumeric(ko.unwrap(d[paramElem.wfmParameterId])) ? (ko.unwrap(d[paramElem.wfmParameterId]) * ko.unwrap(ko.unwrap(paramElem.wfmParameter).uomCoef)) : null
                            );
                        });

                        columnPathJson[paramElem.wfmParameterId] = line(tmpFilteredByDateProductionDataSet);
                    }
                });
            }

            return columnPathJson;
        });

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
                    prtl.WPDDateStartYear(yearList.length > 1 ? (endDate.getFullYear() - 1) : endDate.getFullYear());
                    prtl.WPDDateEndYear(endDate.getFullYear());
                }
                return yearList;
            },
            deferEvaluation: true
        });

        prtl.forecastYearList = ko.computed({
            read: function () {
                var tmpStartForecastUnixTime = ko.unwrap(prtl.startForecastUnixTime);
                var tmpEndForecastUnixTime = ko.unwrap(prtl.endForecastUnixTime);

                if (tmpStartForecastUnixTime && tmpEndForecastUnixTime) {
                    return appHelper.getYearList(new Date(tmpStartForecastUnixTime * 1000).getFullYear() + 1, new Date(tmpEndForecastUnixTime * 1000).getFullYear());
                }
            },
            deferEvaluation: true
        });

        prtl.joinedYearList = ko.computed({
            read: function () {
                if (ko.unwrap(prtl.isVisibleForecastData)) {
                    return prtl.forecastYearList().concat(ko.unwrap(prtl.histYearList));
                }
                else {
                    return ko.unwrap(prtl.histYearList);
                }
            },
            deferEvaluation: true
        });

        // All history data; without any filters
        prtl.getHstProductionDataSet = function () {
            prtl.isLoadedHstProductionData(false);
            datacontext.getProductionData({ well_id: wellObj.Id }).done(function (result) {
                prtl.hstProductionDataSet(importProductionDataSetDto(result, wellObj));
                prtl.isLoadedHstProductionData(true);
            });
        };

        prtl.isForecastPossible = ko.computed({
            read: function () {
                return ko.unwrap(prtl.firstForecastPd) ? true : false;
            },
            deferEvaluation: true
        });

        prtl.dcaProductionDataSet = ko.computed({
            read: function () {
                // set first elem in forecast collection
                var lastDca = ko.unwrap(prtl.firstForecastPd);

                // only if forecast possible
                if (!lastDca) { return; }

                var forecastArr = [lastDca];

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
                    var daysInMonth = moment(k * 1000).daysInMonth();

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

                return forecastArr;
            },
            deferEvaluation: true
        });

        prtl.deleteWellProductionData = function () {
            if (confirm('Are you sure you want to delete all production data from well?')) {
                datacontext.deleteWellProductionData(wellObj.Id).done(function () {
                    prtl.hstProductionDataSet([]);
                });
            }
        };

        return prtl;
    }

    return {
        init: function (wellObj) { return new PerfomancePartial(wellObj); }
    };
});