define(['knockout', 'app/datacontext'], function (ko, datacontext) {
    'use strict';

    var uomCoefDict = {
        time: {
            sec: 1,
            min: 60,
            hr: 3600,
            d: 86400
        },
        volume: {
            m3: 1,
            bbl: 0.159159637116027, //? approximately
            Mbbl: 159.159637116027, // 1 000 barrels
            MMbbl: 159159.637116027, // 1 000 000 barrels
            scf: 0.028316846592, // Math.Pow(0.3048, 3);
            Mcf: 28.316846592, // Math.Pow(0.3048, 3) * 1000
            MMcf: 28316.846592, // Math.Pow(0.3048, 3) * 1000000
            in3: 0.000016387064, // Math.Pow(0.3048 / 12, 3);
            L: 0.001,
            galUS: 0.003785411784, // 231 * Math.Pow(0.3048 / 12, 3);// 231 * cui
            galUK: 0.00454609 // (4.54609 / 1000);//// official in litres
        },
        temperature: {
            '°F': 1
        }
    };

    function getUomCoefFromDict(needUom, needCoefDict) {
        var result;
        for (var coefGroup in needCoefDict) {
            for (var coefItem in needCoefDict[coefGroup]) {
                if (needUom === coefItem) {
                    result = needCoefDict[coefGroup][coefItem];
                }
            }
        }

        return result;
    }

    // [['bbl'],['d']] -> bbl/d
    // [['kg','m'], ['s']] -> kg*m/s
    function convertMatrixToStr(uomMatrix) {
        // [['kg','m'], ['s']] -> ['kg*m','s']
        var groupArr = [];
        for (var i = 0; i < uomMatrix.length; i += 1) {
            groupArr.push(uomMatrix[i].join('*'));
        }

        // ['kg*m','s'] -> kg*m/s
        return groupArr.join('/');
    }

    // bbl/d -> [['bbl'],['d']]
    // kg*m/s -> [['kg','m'], ['s']]
    function convertStrToMatrix(uomStr) {
        // divide by numerator and denominator
        var tmpList = uomStr.split('/');

        var readyMatrix = [];
        for (var i = 0; i < tmpList.length; i += 1) {
            readyMatrix.push(tmpList[i].split('*'));
        }

        return readyMatrix;
    }

    function WfmParameter(data) {
        var self = this;
        data = data || {};

        self.id = data.Id;
        self.name = ko.observable(data.Name);
        self.uom = ko.observable(data.Uom);

        // Todo: need to store in db as this array
        // For Newton: [[kg,m],[s,s]]
        // For Speed: [[m],[s,s]]
        // For Gas: [[f, f, f]] or [[scf]] - standard cubic feet
        self.sourceUomMatrix = convertStrToMatrix(data.Uom);
        self.uomMatrix = ko.computed(function () { return convertStrToMatrix(self.uom()); });

        self.defaultColor = ko.observable(data.DefaultColor);
        self.isCumulative = ko.observable(data.IsCumulative);
        self.isSystem = ko.observable(data.IsSystem);

        // well file manager parameter group id
        self.wfmParamSquadId = ko.observable(data.WfmParamSquadId);

        // List of possible units of measurements (for choosed uom)
        self.getPossibleUomListForSelectedUom = function (selectedUom) {
            // choose group for need unit of measurement
            var needGroup;
            for (var uomCoefGroup in uomCoefDict) {
                for (var uomCoefItem in uomCoefDict[uomCoefGroup]) {
                    if (uomCoefItem === selectedUom) {
                        needGroup = uomCoefDict[uomCoefGroup];
                    }
                }
            }

            var resultList = [];
            // convert group to array (exclude need uom)
            if (needGroup) {
                for (var uomCoefMain in needGroup) {
                    if (uomCoefMain !== selectedUom) {
                        resultList.push(uomCoefMain);
                    }
                }
            }

            return resultList;
        };

        self.changeSelectedUom = function (selectedUom, selectedUomSquadPosition, selectedUomPosition) {
            ////var prevSelectedUom = self.uomMatrix()[selectedUomSquadPosition][selectedUomPosition];
            var uomMatrixNew = self.uomMatrix().slice();
            uomMatrixNew[selectedUomSquadPosition][selectedUomPosition] = selectedUom;
            self.uom(convertMatrixToStr(uomMatrixNew));
        };

        // If user wants to remember coef state than use cookies and change after initialization
        self.uomCoef = ko.computed({
            read: function () {
                var coef = 1;

                var currentUomMatrix = self.uomMatrix();
                for (var i = 0; i < self.sourceUomMatrix.length; i += 1) {
                    for (var j = 0; j < self.sourceUomMatrix[i].length; j += 1) {
                        var curItem = currentUomMatrix[i][j];
                        var srcItem = self.sourceUomMatrix[i][j];

                        if (curItem !== srcItem) {
                            // get coef (only for changed values)
                            if (i === 0) {
                                // If numerator (first value in array)
                                coef *= getUomCoefFromDict(srcItem, uomCoefDict) / getUomCoefFromDict(curItem, uomCoefDict);
                            }
                            else if (i === 1) {
                                // If denominator (second value in array)
                                coef /= getUomCoefFromDict(srcItem, uomCoefDict) / getUomCoefFromDict(curItem, uomCoefDict);
                            }
                        }
                    }
                }

                return coef;
            },
            deferEvaluation: true
        });

        self.toPlainJson = function () { return ko.toJS(this); };
    }

    datacontext.createWfmParameter = function (data) {
        return new WfmParameter(data);
    };
});