define(['jquery',
    'ko',
    'd3'
], function ($, ko, d3) {
    'use strict';

    function PerfomanceView(optns, prfPartial) {
        var prfv = this;

        prfv.prfPartial = prfPartial;

        prfv.isVisibleForecastData = ko.observable(optns.isVisibleForecastData);

        prfv.selectedPrfTableYear = ko.observable();
        prfv.selectPrfTableYear = function (selectedPrfTableYearItem) {
            prfv.selectedPrfTableYear(selectedPrfTableYearItem);
        };

        prfv.monthList = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

        prfv.WPDDateStartYear = ko.observable();
        prfv.WPDDateEndYear = ko.observable();
        prfv.WPDDateStartMonth = ko.observable(1);
        prfv.WPDDateEndMonth = ko.observable(12);

        function updateSelectedPrfTableYear() {
            var tmpWpdDateStartYear = ko.unwrap(prfv.WPDDateStartYear),
                tmpWpdDateEndYear = ko.unwrap(prfv.WPDDateEndYear),
                tmpSelectedPrfTableYear = ko.unwrap(prfv.selectedPrfTableYear);

            if (tmpWpdDateStartYear && tmpWpdDateEndYear) {
                if (!tmpSelectedPrfTableYear || tmpSelectedPrfTableYear < tmpWpdDateStartYear || tmpSelectedPrfTableYear > tmpWpdDateEndYear) {
                    prfv.selectedPrfTableYear(tmpWpdDateStartYear);
                }
            }
        }

        prfv.WPDDateStartYear.subscribe(updateSelectedPrfTableYear);
        prfv.WPDDateEndYear.subscribe(updateSelectedPrfTableYear);

        prfv.selectedAttrGroup = ko.observable();

        prfv.selectAttrGroup = function (attrGroup) {
            prfv.selectedAttrGroup(attrGroup);
        };

        // Well group parameters for selected squad
        prfv.selectedWellGroupWfmParameterList = ko.computed({
            read: function () {
                var resultArr = [];
                var tmpSelectedAttrGroup = ko.unwrap(prfv.selectedAttrGroup);
                if (tmpSelectedAttrGroup) {
                    // list of wg parameters for this well group
                    var tmpWellGroupWfmParameterList = ko.unwrap(prfPartial.getWellObj().getWellGroup().wellGroupWfmParameterList);

                    // list of parameter for selected squad
                    var tmpSelectedWfmParameterList = ko.unwrap(tmpSelectedAttrGroup.wfmParameterList);

                    // Select only parameter ids
                    var tmpSelectedWfmParameterIdList = $.map(tmpSelectedWfmParameterList, function (ssgElem) {
                        return ssgElem.id;
                    });

                    // return only well group wfm parameters in selected squad
                    resultArr = $.grep(tmpWellGroupWfmParameterList, function (wgpElem) {
                        return $.inArray(wgpElem.wfmParameterId, tmpSelectedWfmParameterIdList) >= 0;
                    });
                }

                return resultArr;
            },
            deferEvaluation: true
        });

        function filterDataByDate(startYear, endYear, startMonth, endMonth, hasForecast) {
            var resultArr = [];
            if (startYear && endYear) {
                // Seconds from Unix Epoch
                var startUnixTime = new Date(Date.UTC(startYear, startMonth - 1, 1)).getTime() / 1000;
                var endUnixTime = new Date(Date.UTC(endYear, endMonth - 1, 1)).getTime() / 1000;

                var prdArray;
                if (hasForecast) {
                    prdArray = ko.unwrap(prfPartial.dcaProductionDataSet).concat(ko.unwrap(prfPartial.hstProductionDataSet));
                }
                else {
                    prdArray = ko.unwrap(prfPartial.hstProductionDataSet);
                }

                resultArr = ko.utils.arrayFilter(prdArray, function (r) {
                    return ((r.unixTime >= startUnixTime) && (r.unixTime <= endUnixTime));
                });
            }

            return resultArr;
        }

        prfv.filteredByDateProductionDataSet = ko.computed({
            read: function () {
                return filterDataByDate(
                    ko.unwrap(prfv.WPDDateStartYear),
                    ko.unwrap(prfv.WPDDateEndYear),
                    ko.unwrap(prfv.WPDDateStartMonth),
                    ko.unwrap(prfv.WPDDateEndMonth),
                    ko.unwrap(prfv.isVisibleForecastData) ? true : false
                    );
            },
            deferEvaluation: true
        });


        // Real time border: min and max values in unix time format
        // This time border other than WPDDateStartYear, EndYear (ant other selectable values)
        prfv.filteredByDateProductionDataSetTimeBorder = ko.computed({
            read: function () {
                var arr = ko.unwrap(prfv.filteredByDateProductionDataSet);
                if (arr.length === 0) { return []; }

                return [arr[arr.length - 1].unixTime, arr[0].unixTime];
            },
            deferEvaluation: true
        });

        // Real value border: min and max values of data in selected squad
        prfv.filteredByDateProductionDataSetValueBorder = ko.computed({
            read: function () {
                // get max and min value to find coef for graph
                var minValue, maxValue;

                $.each(ko.unwrap(prfv.filteredByDateProductionDataSet), function (prfIndex, prfElem) {
                    $.each(ko.unwrap(prfv.selectedWellGroupWfmParameterList), function (clmIndex, clmElem) {
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

        // actual height of graph ang y-axis
        prfv.prfGraphHeight = ko.observable();

        function getSvgPath(dataSet, paramList, timeBorder, valueBorder) {
            var resultJson = {};

            // Check parameter and data existence
            if (dataSet.length > 0 &&
                paramList.length > 0 &&
                $.isNumeric(timeBorder[0]) &&
                $.isNumeric(timeBorder[1]) &&
                $.isNumeric(valueBorder[0]) &&
                $.isNumeric(valueBorder[1])) {

                ////require(['d3'], function (d3) {
                var x = d3.time.scale().range([0, prfPartial.prfGraph.viewBox.width]),
                    y = d3.scale.linear().range([prfPartial.prfGraph.viewBox.height, 0]);

                var line = d3.svg.line()
                    .interpolate('linear')
                    ////monotone
                    .x(function (d) { return x(new Date(d.unixTime * 1000)); });

                x.domain([new Date(timeBorder[0] * 1000), new Date(timeBorder[1] * 1000)]);
                y.domain(valueBorder);

                $.each(paramList, function (paramIndex, paramElem) {
                    if (ko.unwrap(paramElem.isVisible) === true) {
                        line.y(function (d) {
                            return y(
                                $.isNumeric(ko.unwrap(d[paramElem.wfmParameterId])) ? (ko.unwrap(d[paramElem.wfmParameterId]) * ko.unwrap(ko.unwrap(paramElem.wfmParameter).uomCoef)) : null
                            );
                        });

                        resultJson[paramElem.wfmParameterId] = line(dataSet);
                    }
                });
            }

            return resultJson;
        }

        // Update perfomance graph data: graph path for selected regions
        prfv.productionDataSetSvgPath = ko.computed(function () {
            return getSvgPath(
                    ko.unwrap(prfv.filteredByDateProductionDataSet),
                    ko.unwrap(prfv.selectedWellGroupWfmParameterList),
                    ko.unwrap(prfv.filteredByDateProductionDataSetTimeBorder),
                    ko.unwrap(prfv.filteredByDateProductionDataSetValueBorder));
        });

        prfv.joinedYearList = ko.computed({
            read: function () {
                if (ko.unwrap(prfv.isVisibleForecastData)) {
                    return prfPartial.forecastYearList().concat(ko.unwrap(prfPartial.histYearList));
                }
                else {
                    return ko.unwrap(prfPartial.histYearList);
                }
            },
            deferEvaluation: true
        });

        return prfv;
    }

    return {
        init: function (optns, prfPartialItem) {
            return new PerfomanceView(optns, prfPartialItem);
        }
    };
});