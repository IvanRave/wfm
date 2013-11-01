define(['jquery', 'app/app-helper'], function ($, appHelper) {
    'use strict';

    function wellRegionUrl(uqp) {
        return '{{conf.requrl}}/api/wellregion/' + (uqp ? ('?' + $.param(uqp)) : '');
    }
    function wellFieldUrl(uqp) {
        return '{{conf.requrl}}/api/wellfield/' + (uqp ? ('?' + $.param(uqp)) : '');
    }
    function wellGroupUrl(uqp) {
        return '{{conf.requrl}}/api/wellgroup/' + (uqp ? ('?' + $.param(uqp)) : '');
    }
    function wellUrl(uqp) {
        return '{{conf.requrl}}/api/well/' + (uqp ? ('?' + $.param(uqp)) : '');
    }
    function wellFileUrl(uqp) {
        return '{{conf.requrl}}/api/wellfile/' + (uqp ? ('?' + $.param(uqp)) : '');
    }
    function columnAttributeUrl(uqp) {
        return '{{conf.requrl}}/api/columnattribute/' + (uqp ? ('?' + $.param(uqp)) : '');
    }
    function wellHistoryUrl(uqp) {
        return '{{conf.requrl}}/api/wellhistory/' + (uqp ? ('?' + $.param(uqp)) : '');
    }
    function wfmImageUrl(uqp) {
        return '{{conf.requrl}}/api/wfmimage/' + (uqp ? ('?' + $.param(uqp)) : '');
    }
    function wellFieldMapUrl(uqp) {
        return '{{conf.requrl}}/api/wellfieldmap/' + (uqp ? ('?' + $.param(uqp)) : '');
    }
    function wellFieldMapAreaUrl(uqp) {
        return '{{conf.requrl}}/api/wellfieldmaparea/' + (uqp ? ('?' + $.param(uqp)) : '');
    }
    function wellInWellFieldMapUrl(uqp) {
        return '{{conf.requrl}}/api/wellinwellfieldmap/' + (uqp ? ('?' + $.param(uqp)) : '');
    }
    function wellHistoryFileUrl(uqp) {
        return '{{conf.requrl}}/api/wellhistoryfile/' + (uqp ? ('?' + $.param(uqp)) : '');
    }
    function fileManagerUrl() {
        return '/wfm-template/workspace/file-manager.html';
    }
    function userProfileUrl(uqp) {
        return '{{conf.requrl}}/api/userprofile/' + (uqp ? ('?' + $.param(uqp)) : '');
    }
    function productionDataUrl(uqp) {
        return '{{conf.requrl}}/api/productiondata/' + (uqp ? ('?' + $.param(uqp)) : '');
    }
    function testScopeUrl(uqp) {
        return '{{conf.requrl}}/api/testscope/' + (uqp ? ('?' + $.param(uqp)) : '');
    }
    function testDataUrl(uqp) {
        return '{{conf.requrl}}/api/testdata/' + (uqp ? ('?' + $.param(uqp)) : '');
    }
    function wfmParameterUrl(uqp) {
        return '{{conf.requrl}}/api/wfmparameter/' + (uqp ? ('?' + $.param(uqp)) : '');
    }
    function wellGroupWfmParameterUrl(uqp) {
        return '{{conf.requrl}}/api/wellgroupwfmparameter/' + (uqp ? ('?' + $.param(uqp)) : '');
    }
    function wfmParamSquadUrl(uqp) {
        return '{{conf.requrl}}/api/wfmparamsquad/' + (uqp ? ('?' + $.param(uqp)) : '');
    }
    function forecastEvolutionUrl(uqp) {
        return '{{conf.requrl}}/api/forecastevolution/' + (uqp ? ('?' + $.param(uqp)) : '');
    }
    function accountLogoffUrl(uqp) {
        return '{{conf.requrl}}/api/account/logoff/' + (uqp ? ('?' + $.param(uqp)) : '');
    }
    function accountLogonUrl(uqp) {
        return '{{conf.requrl}}/api/account/logon/' + (uqp ? ('?' + $.param(uqp)) : '');
    }
    function accountRegisterUrl(uqp) {
        return '{{conf.requrl}}/api/account/register/' + (uqp ? ('?' + $.param(uqp)) : '');
    }
    function accountRegisterConfirmationUrl(uqp) {
        return '{{conf.requrl}}/api/account/register/confirmation/' + (uqp ? ('?' + $.param(uqp)) : '');
    }
    function companyUserUrl(uqp) {
        return '{{conf.requrl}}/api/companyuser/' + (uqp ? ('?' + $.param(uqp)) : '');
    }
    function companyUrl(uqp) {
        return '{{conf.requrl}}/api/company/' + (uqp ? ('?' + $.param(uqp)) : '');
    }
    function wellWidgoutUrl(wellId, widgetId) {
        return '{{conf.requrl}}/api/wells/' + wellId + '/widgouts' + (widgetId ? ('/' + widgetId) : '');
    }

    // TODO: move to apphelper.js
    var UrlParameter = (function () {
        // This function is anonymous, is executed immediately and 
        // the return value is assigned to QueryString!
        var query_string = {};
        var query = window.location.search.substring(1);
        var vars = query.split('&');
        for (var i = 0; i < vars.length; i++) {
            var pair = vars[i].split('=');
            // If first entry with this name
            if (typeof query_string[pair[0]] === 'undefined') {
                query_string[pair[0]] = pair[1];
                // If second entry with this name
            } else if (typeof query_string[pair[0]] === 'string') {
                var arr = [query_string[pair[0]], pair[1]];
                query_string[pair[0]] = arr;
                // If third or later entry with this name
            } else {
                query_string[pair[0]].push(pair[1]);
            }
        }

        return query_string;
    }());

    // 1999-12-31 yyyy-mm-dd
    var DatePatternEn = '(?:19|20)[0-9]{2}-(?:(?:0[1-9]|1[0-2])-(?:0[1-9]|1[0-9]|2[0-9])|(?:(?!02)(?:0[1-9]|1[0-2])-(?:30))|(?:(?:0[13578]|1[02])-31))';

    function isValueInteger(checkedValue) {
        return (/^\d+$/).test(checkedValue);
    }

    function getChoosedIdFromHash() {
        var choosedObj = {
            regionId: null,
            fieldId: null,
            groupId: null,
            wellId: null,
            sectionId: null
        };

        var hashParamList = window.location.hash.substr(1).split('/');

        if (hashParamList[0] === "region") {
            if (isValueInteger(hashParamList[1])) {
                choosedObj.regionId = parseInt(hashParamList[1]);

                if (hashParamList[2] === "field") {
                    if (isValueInteger(hashParamList[3])) {
                        choosedObj.fieldId = parseInt(hashParamList[3]);

                        if (hashParamList[4] === "group") {
                            if (isValueInteger(hashParamList[5])) {
                                choosedObj.groupId = parseInt(hashParamList[5]);

                                if (hashParamList[6] === "well") {
                                    if (isValueInteger(hashParamList[7])) {
                                        choosedObj.wellId = parseInt(hashParamList[7]);

                                        if (hashParamList[8] === "section") {
                                            choosedObj.sectionId = hashParamList[9];
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }

        return choosedObj;
    }

    /// <summary>
    /// Get element from list by property value: element with property [propName] equals [propValue]
    /// </summary>
    function getElementByPropertyValue(elemList, propName, propValue) {
        if (propValue === null || !propName) { return null; }

        var needElemValue = null;

        $.each(elemList, function (elemIndex, elemValue) {
            if (elemValue[propName] === propValue) {
                // find elem
                needElemValue = elemValue;
                // break from cycle
                return false;
            }

            // continue cycle
            return true;
        });

        return needElemValue;
    }

    // Request to server
    function ajaxRequest(type, url, data) { // Ajax helper
        var options = {
            ////dataType: "json",
            cache: false,
            type: type,
            xhrFields: {
                // For CORS request to send cookies
                withCredentials: true
            }
        };

        ////if (true) {
        ////    // default content-type = url-encoded string
        ////}
        ////else {
        options.contentType = 'application/json; charset=utf-8';
        ////}

        if (data) {
            // all knockout models need contain toPlainJson function, 
            // which converts knockout object to plain object (observables to plain objects etc.)
            if ($.isFunction(data.toPlainJson)) {
                ////if (true) {
                ////    try {
                ////        options.data = $.param(data.toPlainJson());
                ////    }
                ////    catch (err) {
                ////        console.log(err);
                ////    }
                ////}
                ////else {
                options.data = JSON.stringify(data.toPlainJson());
                ////}
            }
            else if ($.isArray(data)) {
                // each array element convert to plain json (it is not an appropriate way: would be better to convert each element to plain json before sending to ajaxRequest)
                // for other libraries (not knockout models - for plain JSON objects)
                options.data = JSON.stringify(data);
            }
            else {
                console.log('not ko object and not array');
                console.log(data);
                console.log(JSON.stringify(data));
                // for other libraries (not knockout models - for plain JSON objects)
                options.data = JSON.stringify(data);
            }

            // remove knockout dependency from this module
            ////data: JSON.stringify(ko.toJS(data)) 
            ////ko.toJSON(data)
        }

        appHelper.toggleLoadingState(true);
        return $.ajax(url, options)
            .fail(function (jqXHR, textStatus, errorThrown) {
                // TODO: include notification system: https://github.com/Nijikokun/bootstrap-notify
                console.log(jqXHR);
                switch (jqXHR.status) {
                    case 401:
                        window.location.href = '{{syst.logonUrl}}{{conf.defPage}}';
                        break;
                    case 404:
                        alert('Data is not found');
                        break;
                    case 422:
                        // Business-logic errors
                        // TODO: handle all 400 errors
                        break;
                    case 400:
                        var resJson = jqXHR.responseJSON;
                        console.log(resJson);
                        if (resJson.errId === 'validationErrors') {
                            // Show window - but modal window can be active already
                            // TODO: make realization for all cases, or show in alert

                            require(['app/lang-helper'], function (langHelper) {
                                var errMsg = '{{capitalizeFirst lang.validationErrors}}:';
                                $.each(resJson.modelState, function (stateKey, stateValue) {
                                    errMsg += '\n' + (langHelper.translate(stateKey) || stateKey) + ': ';

                                    $.each(stateValue, function (errIndex, errValue) {
                                        errMsg += langHelper.translateRow(errValue) + '; ';
                                    });
                                });

                                alert(errMsg);
                            });

                            return;
                        }
                        else {
                            console.log(resJson);
                            alert(textStatus + ": " + jqXHR.responseText + " (" + errorThrown + ")");
                        }

                        break;
                    default:
                        alert(textStatus + ": " + jqXHR.responseText + " (" + errorThrown + ")");
                        console.log(jqXHR);
                }
            })
            .always(function () {
                appHelper.toggleLoadingState(false);
            });
    }

    // DataContext operations
    // 1. WellRegion
    function getWellRegionList(uqp) {
        return ajaxRequest("get", wellRegionUrl(uqp));
    }

    function saveNewWellRegion(item) {
        return ajaxRequest("post", wellRegionUrl(), item);
    }

    function deleteWellRegion(item) {
        return ajaxRequest("delete", wellRegionUrl({ id: item.Id }));
    }

    function saveChangedWellRegion(item) {
        return ajaxRequest("put", wellRegionUrl({ id: item.Id }), item);
    }

    // 2. WellField
    function saveNewWellField(item) {
        return ajaxRequest("post", wellFieldUrl(), item);
    }

    function deleteWellField(id) {
        return ajaxRequest("delete", wellFieldUrl({ id: id }));
    }

    function saveChangedWellField(item) {
        return ajaxRequest("put", wellFieldUrl({ id: item.Id }), item);
    }

    // 3. WellGroup
    function saveNewWellGroup(item) {
        return ajaxRequest("post", wellGroupUrl(), item);
    }

    function deleteWellGroup(item) {
        return ajaxRequest("delete", wellGroupUrl({ id: item.Id }));
    }

    function saveChangedWellGroup(item) {
        return ajaxRequest("put", wellGroupUrl({ id: item.Id }), item);
    }

    function saveNewWell(item) {
        return ajaxRequest("post", wellUrl(), item);
    }

    function deleteWell(item) {
        return ajaxRequest("delete", wellUrl({ id: item.Id }));
    }

    function saveChangedWell(item) {
        return ajaxRequest("put", wellUrl({ id: item.Id }), item);
    }

    // get list
    function getWellFiles(urlQueryParams) {
        return ajaxRequest("get", wellFileUrl(urlQueryParams));
    }

    function getWellFileUrl(urlQueryParams) {
        return wellFileUrl(urlQueryParams);
    }

    function deleteWellFile(data) {
        var urlQueryParams = {
            well_id: data.WellId,
            purpose: data.Purpose,
            status: data.Status,
            file_name: data.Name()
        };

        return ajaxRequest("delete", wellFileUrl(urlQueryParams));
    }

    function postWellFile(urlQueryParams, data) {
        return ajaxRequest('post', wellFileUrl(urlQueryParams), data);
    }

    function importWellFileToPD(urlQueryParams, columnAttrList) {
        // public void Get(int well_id, string purpose, string status, string file_name, string headers_match)
        return ajaxRequest('POST', wellFileUrl(urlQueryParams), columnAttrList);
    }

    // 6. Production data
    function getProductionData(urlQueryParams) {
        return ajaxRequest("get", productionDataUrl(urlQueryParams));
    }

    function deleteWellProductionData(wellId) {
        return ajaxRequest("delete", productionDataUrl({ "well_id": wellId }));
    }

    // 7. Column attribute
    function getColumnAttributes(urlQueryParams) {
        return ajaxRequest('get', columnAttributeUrl(urlQueryParams));
    }

    function getWfmParamSquadList(uqp) {
        return ajaxRequest('get', wfmParamSquadUrl(uqp));

        ////return ['rate', 'cumulative', 'watercut', 'gor'];
    }

    function getColumnAttributesLocal() {
        // scf - standart cubic feet
        // Mcf - Mega cubic feet
        // gph (US) - gallon per hour
        // gpd (UK) - gallon per day (imperial gallon - imp gal)
        // 1 gal (UK) = 4,54609 L
        // 1 gal (US) = 3,785411784 L = 231 in3
        // bbl - Oil barrel
        var volumeArr = ['bbl', 'Mbbl', 'MMbbl', 'scf', 'Mcf', 'MMcf', 'in3', 'm3', 'L', 'galUS', 'galUK'];
        var timeArr = ['d', 'hr', 'min', 'sec'];

        var arr = [
            { Id: 0, Name: 'WaterCut', Format: '%', Group: 'watercut', IsVisible: true, IsCalc: false, AssId: null, NumeratorList: ['%'], CurveColor: [121, 160, 193] },
            { Id: 1, Name: 'OilRate', Format: 'bbl/d', Group: 'rate', IsVisible: true, IsCalc: false, AssId: null, NumeratorList: volumeArr, DenominatorList: timeArr, CurveColor: [255, 204, 0] },
            { Id: 2, Name: 'WaterRate', Format: 'bbl/d', Group: 'rate', IsVisible: true, IsCalc: false, AssId: 10, NumeratorList: volumeArr, DenominatorList: timeArr, CurveColor: [20, 67, 106] },
            { Id: 3, Name: 'GasRate', Format: 'scf/d', Group: 'rate', IsVisible: true, IsCalc: false, AssId: null, NumeratorList: volumeArr, DenominatorList: timeArr, CurveColor: [131, 43, 51] },
            { Id: 4, Name: 'LiquidRate', Format: 'bbl/d', Group: 'rate', IsVisible: true, IsCalc: false, AssId: 11, NumeratorList: volumeArr, DenominatorList: timeArr, CurveColor: [3, 146, 0] },
            { Id: 5, Name: 'OilCum', Format: 'bbl', Group: 'cumulative', IsVisible: true, IsCalc: false, AssId: 13, NumeratorList: volumeArr, CurveColor: [255, 136, 0] },
            { Id: 6, Name: 'GasCum', Format: 'scf', Group: 'cumulative', IsVisible: true, IsCalc: false, AssId: 15, NumeratorList: volumeArr, CurveColor: [220, 20, 60] },
            { Id: 7, Name: 'WaterCum', Format: 'bbl', Group: 'cumulative', IsVisible: true, IsCalc: false, AssId: 14, NumeratorList: volumeArr, CurveColor: [64, 108, 145] },
            { Id: 8, Name: 'GOR', Format: 'scf/bbl', Group: 'gor', IsVisible: true, IsCalc: false, AssId: 12, NumeratorList: volumeArr, DenominatorList: volumeArr, CurveColor: [146, 0, 10] },
            { Id: 9, Name: 'LiquidCum', Format: 'bbl', Group: 'cumulative', IsVisible: true, IsCalc: false, AssId: 16, NumeratorList: volumeArr, CurveColor: [36, 101, 35] },

            { Id: 10, Name: 'CalcWaterRate', Format: 'bbl/d', Title: '= LiquidRate * WaterCut(%)', Group: 'rate', IsVisible: false, IsCalc: true, NumeratorList: volumeArr, DenominatorList: timeArr, CurveColor: [20, 67, 106] },
            { Id: 11, Name: 'CalcLiquidRate', Format: 'bbl/d', Title: '= WaterRate + OilRate', Group: 'rate', IsVisible: false, IsCalc: true, NumeratorList: volumeArr, DenominatorList: timeArr, CurveColor: [3, 146, 0] },
            { Id: 12, Name: 'CalcGOR', Format: 'scf/bbl', Title: '= (GasRate * 1000) / OilRate', Group: 'gor', IsVisible: false, IsCalc: true, NumeratorList: volumeArr, DenominatorList: volumeArr, CurveColor: [146, 0, 10] },
            { Id: 13, Name: 'CalcOilCum', Format: 'bbl', Title: '= OilRate * ProdDays + PREVIOUS(CalcOilCum)', Group: 'cumulative', IsVisible: false, IsCalc: true, NumeratorList: volumeArr, CurveColor: [255, 136, 0] },
            { Id: 14, Name: 'CalcWaterCum', Format: 'bbl', Title: '= WaterRate * ProdDays + PREVIOUS(CalcWaterCum)', Group: 'cumulative', IsVisible: false, IsCalc: true, NumeratorList: volumeArr, CurveColor: [64, 108, 145] },
            { Id: 15, Name: 'CalcGasCum', Format: 'scf', Title: '= GasRate * ProdDays + PREVIOUS(CalcGasCum)', Group: 'cumulative', IsVisible: false, IsCalc: true, NumeratorList: volumeArr, CurveColor: [220, 20, 60] },
            { Id: 16, Name: 'CalcLiquidCum', Format: 'bbl', Title: '= CalcLiquidRate * ProdDays + PREVIOUS(CalcLiquidRate)', Group: 'cumulative', IsVisible: false, IsCalc: true, NumeratorList: volumeArr, CurveColor: [36, 101, 35] }
        ];

        return arr;
    }

    var imageMimeTypes = ["image/jpeg", "image/png", "image/tiff"];

    function getSectionList() {
        return [
        { id: 'summary', name: 'Summary', formatList: ['*'] }, // any file type (main well files)
        { id: 'sketch', name: 'Sketch', formatList: ['image/jpeg', 'image/png'] },
        { id: 'volume', name: 'Volume', formatList: ['image/jpeg', 'image/png'] },
        { id: 'history', name: 'History', formatList: ['*'] }, // any file type
        { id: 'map', name: 'Map', formatList: [] }, // file loading forbidden
        { id: 'log', name: 'Log', formatList: [''] }, // las files has empty mime type
        { id: 'pd', name: 'Perfomance', formatList: ['text/plain', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-excel'] },
        { id: 'test', name: 'Test', formatList: [] }, // file loading forbidden
        { id: 'integrity', name: 'Integrity', formatList: ['image/jpeg', 'image/png', 'application/pdf'] },
        { id: 'nodalanalysis', name: 'Nodal analysis', formatList: ['image/jpeg', 'image/png'] },
        { id: 'report', name: 'Report', formatList: ['application/pdf'] }
        ];
    }

    // 8. WellHistory
    function getWellHistoryList(urlQueryParams) {
        return ajaxRequest('get', wellHistoryUrl(urlQueryParams));
    }

    function saveNewWellHistory(item) {
        return ajaxRequest('post', wellHistoryUrl(), item);
    }

    function saveChangedWellHistory(item) {
        return ajaxRequest('put', wellHistoryUrl({ id: item.Id }), item);
    }

    function deleteWellHistory(item) {
        return ajaxRequest('delete', wellHistoryUrl({ id: item.Id }));
    }

    // 9. WfmImage
    function saveNewWfmImage(urlQueryParams, item) {
        return ajaxRequest('post', wfmImageUrl(urlQueryParams), item);
    }

    function deleteWfmImage(item) {
        return ajaxRequest('delete', wfmImageUrl({ id: item.Id }));
    }

    // 10. WellFieldMap
    function getWellFieldMapUrl(urlQueryParams) {
        return wellFieldMapUrl(urlQueryParams);
    }

    function getWellFieldMaps(urlQueryParams) {
        return ajaxRequest('get', wellFieldMapUrl(urlQueryParams));
    }

    ////function saveNewWellFieldMap(item) {
    ////    return ajaxRequest('post', wellFieldMapUrl(), item);
    ////}

    function saveChangedWellFieldMap(item) {
        return ajaxRequest('put', wellFieldMapUrl({ 'id': item.Id }), item);
    }

    function deleteWellFieldMap(item) {
        return ajaxRequest('delete', wellFieldMapUrl({ 'id': item.Id }));
    }

    // 11. WellFieldMapArea
    function getWellFieldMapAreas(urlQueryParams) {
        return ajaxRequest('get', wellFieldMapAreaUrl(urlQueryParams));
    }

    function saveNewWellFieldMapArea(item) {
        return ajaxRequest('post', wellFieldMapAreaUrl(), item);
    }

    function saveChangedWellFieldMapArea(item) {
        return ajaxRequest('put', wellFieldMapAreaUrl({ 'id': item.Id }), item);
    }

    function deleteWellFieldMapArea(item) {
        return ajaxRequest('delete', wellFieldMapAreaUrl({ 'id': item.Id }));
    }

    // 12. WellInWellFieldMap
    function getWellInWellFieldMaps(urlQueryParams) {
        return ajaxRequest('get', wellInWellFieldMapUrl(urlQueryParams));
    }

    function saveNewWellInWellFieldMap(item) {
        return ajaxRequest('post', wellInWellFieldMapUrl(), item);
    }

    function saveChangedWellInWellFieldMap(item) {
        return ajaxRequest('put', wellInWellFieldMapUrl(), item);
    }

    function deleteWellInWellFieldMap(urlQueryParams) {
        return ajaxRequest('delete', wellInWellFieldMapUrl(urlQueryParams));
    }

    function saveNewWellHistoryFile(item) {
        return ajaxRequest('post', wellHistoryFileUrl(), item);
    }

    function deleteWellHistoryFile(item) {
        return ajaxRequest('delete', wellHistoryFileUrl({
            'cloudfile_id': item.CloudFileId,
            'wellhistory_id': item.WellHistoryId
        }));
    }

    function getFileManagerUrl() {
        return fileManagerUrl();
    }

    // user profile
    function createUserProfile(data) {
        return new datacontext.userProfile(data); // from cabinet.model.js
    }

    function getUserProfile() {
        return ajaxRequest('get', userProfileUrl());
    }

    function putUserProfile(data) {
        return ajaxRequest('put', userProfileUrl({ 'id': data.userId }), data);
    }

    function saveNewTestScope(testScopeItem) {
        return ajaxRequest("post", testScopeUrl(), testScopeItem);
    }

    function saveChangedTestScope(testScopeItem) {
        return ajaxRequest("put", testScopeUrl({ id: testScopeItem.id }), testScopeItem);
    }

    function getTestScope(uqp) {
        return ajaxRequest("get", testScopeUrl(uqp));
    }

    function saveNewTestData(testDataItem) {
        return ajaxRequest("post", testDataUrl(), testDataItem);
    }

    function saveChangedTestData(testDataItem) {
        return ajaxRequest("put", testDataUrl({
            testscope_id: testDataItem.testScopeId,
            hournumber: testDataItem.hourNumber
        }), testDataItem);
    }

    function deleteTestData(testDataItem) {
        return ajaxRequest("delete", testDataUrl({
            testscope_id: testDataItem.testScopeId,
            hournumber: testDataItem.hourNumber
        }));
    }

    // parameter list (all parameter only in Library)
    // IsSystem: true
    // for modal window select box, where user may choose some parameters for himself wellgroup
    function getWfmParameterList(uqp) {
        return ajaxRequest("get", wfmParameterUrl(uqp));
    }

    function postWfmParameter(data) {
        return ajaxRequest("post", wfmParameterUrl(), data);
    }

    function putWfmParameter(uqp, data) {
        return ajaxRequest('PUT', wfmParameterUrl(uqp), data);
    }

    // get wellGroup wfmParameter list
    function getWellGroupWfmParameterList(uqp) {
        return ajaxRequest("get", wellGroupWfmParameterUrl(uqp));
        /// return [{
        /// WellGroupId: 123,
        /// WfmParameterId: 'GasRate',
        /// Color: ...
        /// }]       
    }

    // if user create new parameter - before sending need to create wfmParameter in database and get its Id
    // if user choose from library - we know its Id and we know WellGroupId from well
    function postWellGroupWfmParameter(wellGroupWfmParameterItem) {
        return ajaxRequest("post", wellGroupWfmParameterUrl(), wellGroupWfmParameterItem);
    }

    // user wants to change color of parameter (in someone wellGroup)
    function putWellGroupWfmParameter(wellGroupWfmParameterItem) {
        return ajaxRequest("put", wellGroupWfmParameterUrl({
            wellGroupId: wellGroupWfmParameterItem.wellGroupId,
            wfmParameterId: wellGroupWfmParameterItem.WfmParameterId
        }), wellGroupWfmParameterItem);
    }

    // delete parameter from wellgroup
    // need to clean all data from TestData (and ProductionData)
    // if no one used this parameter (no more references to this table) and if parameter is not in the library 
    // then delete from wfmParameter table
    function deleteWellGroupWfmParameter(wellGroupWfmParameterItem) {
        return ajaxRequest("delete", wellGroupWfmParameterUrl({
            wellGroupId: wellGroupWfmParameterItem.wellGroupId,
            wfmParameterId: wellGroupWfmParameterItem.WfmParameterId
        }));
    }

    // ================== forecast evolution
    function getForecastEvolution(wellId) {
        return ajaxRequest("GET", forecastEvolutionUrl({ well_id: wellId }));
    }

    function postForecastEvolution(forecastEvolution) {
        return ajaxRequest("POST", forecastEvolutionUrl(), forecastEvolution);
    }

    var datacontext = {
        // create objects
        getWellRegionList: getWellRegionList,
        // save objects in db 
        saveNewWellRegion: saveNewWellRegion,
        saveNewWellField: saveNewWellField,
        saveNewWellGroup: saveNewWellGroup,
        saveNewWell: saveNewWell,
        // delete objects from db
        deleteWellRegion: deleteWellRegion,
        deleteWellField: deleteWellField,
        deleteWellGroup: deleteWellGroup,
        deleteWell: deleteWell,
        // save changed objects in db
        saveChangedWellRegion: saveChangedWellRegion,
        saveChangedWellField: saveChangedWellField,
        saveChangedWellGroup: saveChangedWellGroup,
        saveChangedWell: saveChangedWell,
        // WellFile
        getWellFiles: getWellFiles,
        getWellFileUrl: getWellFileUrl,
        deleteWellFile: deleteWellFile,
        importWellFileToPD: importWellFileToPD,
        postWellFile: postWellFile,
        // ProductionData
        getProductionData: getProductionData,
        deleteWellProductionData: deleteWellProductionData,
        // ColumnAttribute
        getColumnAttributes: getColumnAttributes,
        getColumnAttributesLocal: getColumnAttributesLocal,
        // WellHistory
        getWellHistoryList: getWellHistoryList,
        saveNewWellHistory: saveNewWellHistory,
        saveChangedWellHistory: saveChangedWellHistory,
        deleteWellHistory: deleteWellHistory,
        // WfmImage
        saveNewWfmImage: saveNewWfmImage,
        deleteWfmImage: deleteWfmImage,
        // WellFieldMap
        getWellFieldMapUrl: getWellFieldMapUrl,
        getWellFieldMaps: getWellFieldMaps,
        //// saveNewWellFieldMap: saveNewWellFieldMap,
        saveChangedWellFieldMap: saveChangedWellFieldMap,
        deleteWellFieldMap: deleteWellFieldMap,
        // WellFieldMapArea
        getWellFieldMapAreas: getWellFieldMapAreas,
        saveNewWellFieldMapArea: saveNewWellFieldMapArea,
        saveChangedWellFieldMapArea: saveChangedWellFieldMapArea,
        deleteWellFieldMapArea: deleteWellFieldMapArea,
        // WellInWellFieldMap
        getWellInWellFieldMaps: getWellInWellFieldMaps,
        saveNewWellInWellFieldMap: saveNewWellInWellFieldMap,
        saveChangedWellInWellFieldMap: saveChangedWellInWellFieldMap,
        deleteWellInWellFieldMap: deleteWellInWellFieldMap,
        // WellHistoryFile
        saveNewWellHistoryFile: saveNewWellHistoryFile,
        deleteWellHistoryFile: deleteWellHistoryFile,
        getFileManagerUrl: getFileManagerUrl,
        // section list
        getSectionList: getSectionList,
        imageMimeTypes: imageMimeTypes,
        // user profile
        createUserProfile: createUserProfile,
        getUserProfile: getUserProfile,
        putUserProfile: putUserProfile,
        // test scope
        saveNewTestScope: saveNewTestScope,
        saveChangedTestScope: saveChangedTestScope,
        getTestScope: getTestScope,
        // ... todo:
        // test data
        saveNewTestData: saveNewTestData,
        saveChangedTestData: saveChangedTestData,
        deleteTestData: deleteTestData,
        // wfm parameter
        getWfmParameterList: getWfmParameterList,
        postWfmParameter: postWfmParameter,
        putWfmParameter: putWfmParameter,
        // well group wfm parameter
        getWellGroupWfmParameterList: getWellGroupWfmParameterList,
        postWellGroupWfmParameter: postWellGroupWfmParameter,
        putWellGroupWfmParameter: putWellGroupWfmParameter,
        deleteWellGroupWfmParameter: deleteWellGroupWfmParameter,
        UrlParameter: UrlParameter,
        getChoosedIdFromHash: getChoosedIdFromHash,
        getElementByPropertyValue: getElementByPropertyValue,
        DatePatternEn: DatePatternEn,
        getWfmParamSquadList: getWfmParamSquadList,
        getForecastEvolution: getForecastEvolution,
        postForecastEvolution: postForecastEvolution
    };

    // Account logoff
    datacontext.accountLogoff = function (uqp) {
        return ajaxRequest('POST', accountLogoffUrl(uqp));
    };

    // Account logon
    datacontext.accountLogon = function (uqp, data) {
        return ajaxRequest('POST', accountLogonUrl(uqp), data);
    };

    // Account register
    datacontext.accountRegister = function (uqp, data) {
        return ajaxRequest('POST', accountRegisterUrl(uqp), data);
    };

    datacontext.accountRegisterConfirmation = function (uqp, data) {
        return ajaxRequest('POST', accountRegisterConfirmationUrl(uqp), data);
    };

    // api/company/
    datacontext.postCompany = function (uqp, data) {
        return ajaxRequest('POST', companyUrl(uqp), data);
    };

    datacontext.getCompany = function (uqp) {
        return ajaxRequest('GET', companyUrl(uqp));
    };

    datacontext.putCompany = function (uqp, data) {
        return ajaxRequest('PUT', companyUrl(uqp), data);
    };

    // api/companyuser/
    datacontext.getCompanyUserList = function (uqp) {
        return ajaxRequest('GET', companyUserUrl(uqp));
    };

    // Widget layouts for well
    datacontext.getWellWidgoutList = function (wellId) {
        return ajaxRequest('GET', wellWidgoutUrl(wellId));
    };

    // Widget layout for well
    datacontext.getWellWidgout = function (wellId, widgoutId) {
        return ajaxRequest('GET', wellWidgoutUrl(wellId, widgoutId));
    };

    return datacontext;
});