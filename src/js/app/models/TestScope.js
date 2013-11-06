define(['jquery', 'knockout', 'app/datacontext', 'moment', 'app/models/TestData'], function ($, ko, datacontext, appMoment) {
    'use strict';

    function importTestDataDtoList(data, testScopeItem) {
        return $.map(data || [],
            function (item) {
                return datacontext.createTestData(item, testScopeItem);
            });
    }

    function TestScope(data, wellItem) {
        var self = this;
        data = data || {};

        self.getWell = function () {
            return wellItem;
        };

        // Guid
        self.id = data.Id;
        self.wellId = data.WellId;
        self.startUnixTime = ko.observable(data.StartUnixTime);
        self.isApproved = ko.observable(data.IsApproved);
        self.conductedBy = ko.observable(data.ConductedBy);
        self.certifiedBy = ko.observable(data.CertifiedBy);

        self.setIsApproved = function (isApprovedVal) {
            self.isApproved(isApprovedVal);
            datacontext.saveChangedTestScope(self);
        };

        self.startUnixTimeDateView = ko.computed({
            read: function () {
                return appMoment(self.startUnixTime() * 1000).format('YYYY-MM-DD HH:mm');
            },
            deferEvaluation: true
        });

        self.testDataList = ko.observableArray();

        self.addTestData = function () {
            var testDataItem = datacontext.createTestData({
                Comment: "",
                HourNumber: self.testDataList().length,
                TestScopeId: self.id,
                Dict: {}
            }, self);

            datacontext.saveNewTestData(testDataItem).done(function (response) {
                self.testDataList.push(datacontext.createTestData(response, self));
            });
        };

        self.deleteTestData = function (testDataItem) {
            if (confirm("Are you sure to delete?") === true) {
                datacontext.deleteTestData(testDataItem).done(function () {
                    self.testDataList.remove(testDataItem);
                });
            }
        };

        self.testDataListUpdateDate = ko.observable(new Date());

        // contains total for test data list dictionary properties
        // total - AVE or SUM (for day)
        self.testDataTotal = ko.computed({
            read: function () {
                var result = {};
                if (self.testDataList().length > 0) {
                    // check for release computed value
                    if (self.testDataListUpdateDate()) {
                        $.each(self.getWell().getWellGroup().wellGroupWfmParameterList(), function (paramIndex, paramValue) {
                            var tempArr = [];
                            $.each(self.testDataList(), function (testDataIndex, testDataValue) {
                                if (typeof testDataValue.dict[paramValue.wfmParameterId] !== "undefined" && testDataValue.dict[paramValue.wfmParameterId] !== null) {
                                    tempArr.push(parseFloat((testDataValue.dict[paramValue.wfmParameterId])));
                                }
                            });

                            if (tempArr.length > 0) {
                                var sum = tempArr.reduce(function (a, b) { return a + b; });
                                result[paramValue.wfmParameterId] = parseFloat(sum / tempArr.length).toFixed(2);
                                if (ko.unwrap(paramValue.wfmParameter().isCumulative) === true) {
                                    result[paramValue.wfmParameterId] *= 24;
                                }
                            }
                        });
                    }
                }

                return result;
            },
            deferEvaluation: true
        });

        self.toPlainJson = function () {
            var copy = ko.toJS(self);
            delete copy.startUnixTimeDateView;
            delete copy.testDataTotal;
            delete copy.testDataListUpdateDate;
            return copy;
        };

        // fill test data list
        self.testDataList(importTestDataDtoList(data.TestDataDtoList, self));
    }

    // test scope with parent - well
    datacontext.createTestScope = function (data, wellItem) {
        return new TestScope(data, wellItem);
    };
});