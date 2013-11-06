define(['jquery', 'knockout', 'app/datacontext'], function ($, ko, datacontext) {
    'use strict';

    function TestData(data, testScopeItem) {
        var self = this;
        data = data || {};

        self.getTestScope = function () {
            return testScopeItem;
        };

        self.hourNumber = data.HourNumber;
        self.testScopeId = data.TestScopeId;
        self.comment = ko.observable(data.Comment);

        self.dict = data.Dict;

        self.isEdit = ko.observable(false);

        var cancelData;
        self.editTestData = function () {
            cancelData = {
                comment: self.comment(),
                dict: $.extend({}, self.dict)
            };

            self.isEdit(true);
        };

        self.saveTestData = function () {
            datacontext.saveChangedTestData(self).done(function (response) {
                self.getTestScope().testDataListUpdateDate(new Date());
                self.comment(response.Comment);
                self.dict = response.Dict;
                self.isEdit(false);
            });
        };

        self.cancelEditTestData = function () {
            self.comment(cancelData.comment);
            self.dict = $.extend({}, cancelData.dict);
            self.isEdit(false);
        };

        self.toPlainJson = function () { return ko.toJS(self); };
    }

    // test data constructor
    datacontext.createTestData = function (data, testScopeItem) {
        return new TestData(data, testScopeItem);
    };
});