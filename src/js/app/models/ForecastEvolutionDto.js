define(['jquery', 'knockout', 'app/datacontext'], function ($, ko, datacontext) {
    'use strict';

    // const properties
    ////self.DZALiquidEvolutionA = ko.observable(3702.02084750191);
    ////self.DZALiquidEvolutionB = ko.observable(-0.000001203411267578);

    ////self.DZAWCTEvolutionC = ko.observable(33.6757313921082);
    ////self.DZAWCTEvolutionD = ko.observable(362.928904098989);

    ////self.DZAGOREvolutionF = ko.observable(-406.624470555493);
    ////self.DZAGOREvolutionG = ko.observable(5837.35653403327);

    // Can be load from external resources
    var libForecastEvolution =
    {
        desc: {
            LiquidEvolutionA: 'Liquid evolution A',
            LiquidEvolutionB: 'Liquid evolution B',
            WctEvolutionC: 'WCT evolution C',
            WctEvolutionD: 'WCT evolution D',
            GorEvolutionF: 'GOR evolution F',
            GorEvolutionG: 'GOR evolution G'
        },
        format: {
            LiquidEvolutionA: 'A * exp(B*X)',
            LiquidEvolutionB: 'A * exp(B*X)',
            WctEvolutionC: 'C * Ln(X) - D',
            WctEvolutionD: 'C * Ln(X) - D',
            GorEvolutionF: 'F * Ln(X) + G',
            GorEvolutionG: 'F * Ln(X) + G'
        }
    };

    function ForecastEvolution(data, wellItem) {
        var self = this;
        data = data || {};

        self.getWell = function () {
            return wellItem;
        };

        // props
        self.WellId = data.WellId;

        self.Dict = ko.observable({});

        // functions
        self.save = function () {
            datacontext.postForecastEvolution(self);
        };

        self.Lib = libForecastEvolution;
        self.EvoList = Object.keys(self.Lib.desc);

        // load empty values for dynamic properties (all evolutions)
        $.each(self.EvoList, function (evoIndex, evoKey) {
            self.Dict()[evoKey] = ko.observable();
            ////self.Dict()[evoKey].subscribe(self.save);
        });

        self.isLoadedDict = ko.observable(false);

        // Load data to empty values
        self.getDict = function () {
            if (!ko.unwrap(self.isLoadedDict)) {
                datacontext.getForecastEvolution(self.WellId).done(function (response) {
                    $.each(self.EvoList, function (evoIndex, evoKey) {
                        ko.unwrap(self.Dict)[evoKey](response.Dict[evoKey]);
                    });

                    self.isLoadedDict(true);
                });
            }
        };

        // Not a number evolution parameter array
        self.requiredForecastEvoListNaN = ko.computed({
            read: function () {
                var tmpDict = ko.unwrap(self.Dict);
                return $.grep(self.EvoList, function (evoKey) {
                    return $.isNumeric(ko.unwrap(tmpDict[evoKey])) === false;
                });
            },
            deferEvaluation: true
        });

        self.requiredForecastEvoListNaNString = ko.computed(function () {
            return ko.unwrap(self.requiredForecastEvoListNaN).join(', ');
        });

        self.toPlainJson = function () { return ko.toJS(self); };
    }

    // constructor
    datacontext.createForecastEvolution = function (data, wellItem) {
        return new ForecastEvolution(data, wellItem);
    };
});