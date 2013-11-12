define(['jquery', 'knockout', 'app/datacontext', 'bootstrap-modal', 'app/app-helper', 'moment', 'app/models/ColumnAttribute'
], function ($, ko, datacontext, bootstrapModal, appHelper, appMoment) {
    'use strict';

    // ColumnAttributes (convert data objects into array)
    function importColumnAttributesDto(data) { return $.map(data || [], function (item) { return datacontext.createColumnAttribute(item); }); }

    function fromOAtoJS(oaDate) {
        var jsDate = new Date((parseFloat(oaDate) - 25569) * 24 * 3600 * 1000);
        return new Date(jsDate.getUTCFullYear(), jsDate.getUTCMonth(), jsDate.getUTCDate(), jsDate.getUTCHours(), jsDate.getUTCMinutes(), jsDate.getUTCSeconds());
    }

    function WellFile(data, well) {
        var self = this;
        data = data || {};

        self.getWell = function () {
            return well;
        };

        self.Name = ko.observable(data.Name);
        self.Size = data.Size;
        self.WellId = data.WellId;
        self.Purpose = data.Purpose;
        self.Status = ko.observable(data.Status);
        self.LastModified = data.LastModified;
        self.ContentType = data.ContentType;

        self.displayedName = ko.computed(function () {
            // fid20101231235959123_ = 21 symbol
            if (appHelper.startsWith(self.Name(), 'fid2') === true) {
                return self.Name().substr(21);
            }
            else {
                return self.Name();
            }
        });

        self.getExt = function () {
            var extArr = self.Name().split('.');
            if (extArr.length > 0) {
                return extArr.pop().toLowerCase();
            }
        };

        self.isChecked = ko.observable(false);

        self.isSelectedWellFileNodal = ko.computed({
            read: function () {
                var tmpWell = self.getWell();
                var tmpSelectedWellFile = ko.unwrap(tmpWell.selectedWellFileNodal);
                var tmpSelectedSectionId = ko.unwrap(tmpWell.selectedSectionId);
                if (tmpSelectedWellFile && tmpSelectedSectionId) {
                    if (tmpSelectedWellFile === self) {
                        return true;
                    }
                }
            },
            deferEvaluation: true
        });

        self.isSelectedWellFileIntegrity = ko.computed({
            read: function () {
                var tmpWell = self.getWell();
                var tmpSelectedWellFile = ko.unwrap(tmpWell.selectedWellFileIntegrity);
                var tmpSelectedSectionId = ko.unwrap(tmpWell.selectedSectionId);
                if (tmpSelectedWellFile && tmpSelectedSectionId) {
                    if (tmpSelectedWellFile === self) {
                        return true;
                    }
                }
            },
            deferEvaluation: true
        });

        self.Url = ko.computed(function () {
            return datacontext.getWellFileUrl({
                well_id: self.WellId,
                purpose: self.Purpose,
                status: self.Status,
                file_name: self.Name
            });
        });

        self.downloadWellFile = function () {
            //e.stopImmediatePropagation(); data, e
            appHelper.downloadURL(self.Url());
        };

        self.downloadAsExt = function (ext) {
            var extUrl = datacontext.getWellFileUrl({
                well_id: self.WellId,
                purpose: self.Purpose,
                status: self.Status,
                file_name: self.Name,
                ext: ext
            });
            appHelper.downloadURL(extUrl);
        };

        self.showLogImage = function () {
            var urlQueryParams = {
                well_id: self.WellId,
                purpose: self.Purpose,
                status: self.Status,
                file_name: self.Name
            };
            self.getWell().wellLogSelectedFile(self);
            self.getWell().IsLogImageEditable(false);
            self.getWell().WellLogImageUrl(datacontext.getWellFileUrl(urlQueryParams));
        };

        self.importWellFileToLog = function () {
            if (self.Purpose !== 'log') { return; }

            var urlQueryParams = {
                well_id: self.WellId,
                purpose: self.Purpose,
                status: self.Status,
                file_name: self.Name
            };

            datacontext.getColumnAttributes(urlQueryParams).done(function (result) {
                var columnAttributes = importColumnAttributesDto(result);

                var selectDepth = document.createElement('select');
                $(selectDepth).addClass('pd-parameter');

                var selectSP = document.createElement('select');
                $(selectSP).addClass('pd-parameter');

                var selectGR = document.createElement('select');
                $(selectGR).addClass('pd-parameter');

                var selectRS = document.createElement('select');
                $(selectRS).addClass('pd-parameter');

                for (var caIndex = 0, caMaxIndex = columnAttributes.length; caIndex < caMaxIndex; caIndex++) {
                    var optionColumnAttribute = document.createElement('option');
                    $(optionColumnAttribute)
                        .val(columnAttributes[caIndex].Id)
                        .html(columnAttributes[caIndex].Name + (columnAttributes[caIndex].Format() ? (', ' + columnAttributes[caIndex].Format()) : ''));

                    switch (columnAttributes[caIndex].Name) {
                        case 'DEPTH': case 'DEPT': selectDepth.appendChild(optionColumnAttribute); break;
                        case 'SP': case 'SPC': selectSP.appendChild(optionColumnAttribute); break;
                        case 'GR': case 'HGRT': case 'GRDS': case 'SGR': case 'NGRT': selectGR.appendChild(optionColumnAttribute); break;
                        case 'RS': case 'RES': case 'RESD': selectRS.appendChild(optionColumnAttribute); break;
                    }
                }

                var innerDiv = document.createElement('div');
                $(innerDiv).addClass('form-horizontal').append(
                    bootstrapModal.gnrtDom('Depth', selectDepth),
                    bootstrapModal.gnrtDom('GR', selectGR),
                    bootstrapModal.gnrtDom('SP', selectSP),
                    bootstrapModal.gnrtDom('Resistivity', selectRS)
                );

                function submitFunction() {
                    var selectedArray = $(innerDiv).find('.pd-parameter').map(function () {
                        return $(this).val();
                    }).get();

                    if (selectedArray.length < 4) {
                        alert('All fields required');
                        return;
                    }

                    var urlQueryParams = {
                        well_id: self.WellId,
                        purpose: self.Purpose,
                        status: self.Status,
                        file_name: self.Name,
                        headers_match: selectedArray.join(','),
                        is_log: true
                    };

                    // return result, textStatus, request
                    datacontext.getWellFiles(urlQueryParams).done(function () {
                        ////self.getWell().WellLogImageUrl(request.getResponseHeader('Location'));
                        self.getWell().getWellFileList();
                        alert('Successfully imported to log image. See image in log section.');
                    });

                    bootstrapModal.closeModalWindow();
                }

                bootstrapModal.closeModalWideWindow();

                bootstrapModal.openModalWindow('Column match', innerDiv, submitFunction);
            });
        };

        self.importToProductionData = function () {
            // only for pd files
            if (self.Purpose !== 'pd') {
                alert('Only for PD files');
                return;
            }

            var urlQueryParams = {
                well_id: self.WellId,
                purpose: self.Purpose,
                status: self.Status(),
                file_name: self.Name(),
                begin_row_index: 0,
                row_count: 10
            };

            datacontext.getWellFiles(urlQueryParams).done(function (response) {
                var bodyDom = document.createElement('div');
                $(bodyDom).css({ 'overflow': 'auto' });
                var fragmentTable = document.createElement('tbody');
                var fragmentTableFoot = document.createElement('tfoot');
                var fragmentTableWrap = document.createElement('table');
                $(fragmentTableWrap).addClass('table-fragment').append(fragmentTableFoot, fragmentTable);
                //addClass('standart-table');
                bodyDom.appendChild(fragmentTableWrap);

                // last column index - to place matching select box for every column
                var maxColumnIndex = 0;

                var isFileExtensionTxt = /txt$/.test(self.Name());

                for (var i = 0, ilimit = response.length; i < ilimit; i++) {
                    var fragmentTR = document.createElement('tr');
                    var jlimit = response[i].length;

                    maxColumnIndex = Math.max(maxColumnIndex, jlimit);

                    // add first column as a data begin index selector
                    for (var j = 0; j < jlimit; j++) {
                        var fragmentTD = document.createElement('td');
                        var cellText = response[i][j];
                        // if not empty then add (0 value - stay in table)
                        if (cellText !== null && cellText !== '') {
                            if (j === 0 && isFileExtensionTxt === false) {
                                // if date column (by agreement - it is first column)
                                // try to convert to YYYY-MM-DD
                                if (parseInt(cellText, 10) % 1 === 0) {
                                    // it is integer
                                    cellText = appMoment(fromOAtoJS(parseInt(cellText, 10))).format('YYYY-MM-DD');
                                }
                            }

                            fragmentTD.appendChild(document.createTextNode(cellText));
                        }

                        fragmentTR.appendChild(fragmentTD);
                    }

                    fragmentTable.appendChild(fragmentTR);
                }

                // get all attributes
                var columnAttrList = datacontext.getColumnAttributesLocal();

                // remove calculated attributes
                columnAttrList = $.grep(columnAttrList, function (arrElem) {
                    if (arrElem.IsCalc === false) {
                        return arrElem;
                    }
                });

                // add ProdDays to columnAttr
                var prodDaysObj = { Name: 'ProdDays', NumeratorList: ['days'] };
                columnAttrList.push(prodDaysObj);

                // add Date to columnAttr
                var dateObj = { Name: 'Date', NumeratorList: ['auto'] };

                if (isFileExtensionTxt === true) {
                    dateObj.NumeratorList = ['d-MMM-yy', 'dd-MMM-yy', 'yyyy-MM-dd', 'M/d/yyyy', 'dd-MM-yyyy', 'MM-dd-yyyy'];
                }

                columnAttrList.push(dateObj);

                // string with column names
                var sourceSelect = '<option></option>';

                for (var clm = 0; clm < columnAttrList.length; clm++) {
                    sourceSelect += '<option val="' + columnAttrList[clm].Name + '">' + columnAttrList[clm].Name + '</option>';
                }

                // 1. set names
                // 2. after select - view volume + time + other
                // 3. after OK - get all names + get all formats + get column index
                // 4. and send to the server
                // string with column formats

                // matching column names
                var matchNameTR = document.createElement('tr');
                fragmentTableFoot.appendChild(matchNameTR);
                // matching column formats
                var matchFormatTR = document.createElement('tr');
                fragmentTableFoot.appendChild(matchFormatTR);

                // collection of select inputs
                var matchSelectList = [];
                // create all inputs and put in collection
                for (var z = 0; z < maxColumnIndex; z++) {
                    var matchNameTD = document.createElement('td');
                    ////$(matchNameTD).addClass('wo-border');
                    // select input for column match names
                    var matchNameSelect = document.createElement('select');
                    $(matchNameSelect).addClass('input-sm').html(sourceSelect);
                    matchNameTD.appendChild(matchNameSelect);
                    matchNameTR.appendChild(matchNameTD);

                    // match formats (numerator)
                    var matchFormatTD = document.createElement('td');
                    // select input for column match names
                    var matchFormatSelect = document.createElement('select');
                    $(matchFormatSelect).addClass('input-sm').hide();
                    matchFormatTD.appendChild(matchFormatSelect);
                    matchFormatTR.appendChild(matchFormatTD);

                    // match formats (denominator)
                    var matchFormatSelectDenominator = document.createElement('select');
                    $(matchFormatSelectDenominator).addClass('input-sm').hide();
                    matchFormatTD.appendChild(matchFormatSelectDenominator);

                    // add both select inputs to main collection
                    matchSelectList.push({
                        matchNameElem: matchNameSelect, matchFormatElem: matchFormatSelect, matchFormatElemDenominator: matchFormatSelectDenominator
                    });
                }

                function fillSelectBoxes(event) {
                    var choosedColumnName = $(event.currentTarget).val();

                    if (!choosedColumnName) {
                        // empty and hide format selectboxes
                        $(matchSelectList[event.data.elemColumnIndex].matchFormatElem).html('').hide();
                        $(matchSelectList[event.data.elemColumnIndex].matchFormatElemDenominator).html('').hide();
                        return;
                    }

                    // select options to upper part (numerator)
                    // get Format list of need element (first element)
                    var columnAttrElement = $.grep(columnAttrList, function (arrElem) {
                        // The filter function must return 'true' to include the item in the result array.
                        return (arrElem.Name === choosedColumnName);
                    })[0];

                    var numeratorOptionList = '';
                    // make select box from format list                        
                    $.each(columnAttrElement.NumeratorList, function (frmIndex, frmElem) {
                        numeratorOptionList += '<option value="' + frmElem + '">' + frmElem + '</option>';
                    });

                    $(matchSelectList[event.data.elemColumnIndex].matchFormatElem).html(numeratorOptionList).show();

                    if (columnAttrElement.DenominatorList) {
                        var denominatorOptionList = '';
                        // make select box from format list                        
                        $.each(columnAttrElement.DenominatorList, function (frmIndex, frmElem) {
                            denominatorOptionList += '<option value="' + frmElem + '">' + frmElem + '</option>';
                        });

                        $(matchSelectList[event.data.elemColumnIndex].matchFormatElemDenominator).html(denominatorOptionList).show();
                    }
                    else {
                        $(matchSelectList[event.data.elemColumnIndex].matchFormatElemDenominator).html('').hide();
                    }
                }

                // Generate select-boxes with unit format from select-box with unit name
                for (var k = 0; k < matchSelectList.length; k += 1) {
                    $(matchSelectList[k].matchNameElem).on('change', { elemColumnIndex: k }, fillSelectBoxes);
                }

                // clickable rows
                $(fragmentTable).find('tr').on('click', function () {
                    $(this).siblings().removeClass("selected-row");
                    $(this).addClass("selected-row");
                });

                // show all rows in modal window (or new tab)
                // show with header select (column name match, column format (divided to volume/time))
                var submitFunction = function () {
                    // calculate beginRowIndex
                    var $selectedRowList = $(fragmentTable).find('tr.selected-row');

                    if ($selectedRowList.length === 0) {
                        alert("Please, select the row where data begins");
                        return;
                    }
                    // end calculate

                    var needColumnListSelected = $.map(matchSelectList, function (arrElem, arrIndex) {
                        if ($(arrElem.matchNameElem).val()) {
                            var pdColumnAttr = datacontext.createColumnAttribute({
                                Id: arrIndex,
                                Name: $(arrElem.matchNameElem).val(),
                                Format: $(arrElem.matchFormatElem).val() + ($(arrElem.matchFormatElemDenominator).val() ? ("/" + $(arrElem.matchFormatElemDenominator).val()) : '')
                            });

                            return pdColumnAttr.toPlainJson();
                        }
                    });

                    // TODO: check Date existing

                    var urlQueryParams = {
                        well_id: self.WellId,
                        purpose: self.Purpose,
                        status: self.Status(),
                        file_name: self.Name(),
                        is_import_pd: true,
                        begin_row_index: $selectedRowList.prevAll().length // get all previous siblings before selected row
                    };

                    datacontext.importWellFileToPD(urlQueryParams, needColumnListSelected).done(function () {
                        bootstrapModal.closeModalWideWindow();
                        // TODO: message
                        // TODO: update model ProductionDataList

                        self.getWell().perfomancePartial.getHstProductionDataSet();
                        alert('Imported successfully: ' + ko.unwrap(self.Name));
                    });
                };

                bootstrapModal.openModalWideWindow(bodyDom, submitFunction);
            });
        };

        ////self.importWellFileToPD = function () {
        ////    // only for pd files
        ////    if (self.Purpose !== 'pd') {
        ////        alert('Only for PD files');
        ////        return;
        ////    }

        ////    // define column headers [header name, measure unit, begin data row]
        ////    var inputHeaderRowNumber = document.createElement('input');
        ////    inputHeaderRowNumber.type = 'text';
        ////    $(inputHeaderRowNumber).addClass('input-sm').val('1').prop({
        ////        'pattern': '[0-9]+',
        ////        'title': 'Only number',
        ////        'required': true
        ////    });

        ////    var inputMeasureRowNumber = document.createElement('input');
        ////    inputMeasureRowNumber.type = 'text';
        ////    $(inputMeasureRowNumber).addClass('input-sm').val('2').prop({
        ////        'pattern': '[0-9]+',
        ////        'title': 'Only number',
        ////        'required': true
        ////    });

        ////    var inputDataBeginRowNumber = document.createElement('input');
        ////    inputDataBeginRowNumber.type = 'text';
        ////    $(inputDataBeginRowNumber).addClass('input-sm').val('3').prop({
        ////        'pattern': '[0-9]+',
        ////        'title': 'Only number',
        ////        'required': true
        ////    });

        ////    var innerDefineColumnDiv = document.createElement('div');
        ////    $(innerDefineColumnDiv).addClass('form-horizontal').append(
        ////        bootstrapModal.gnrtDom('Header row number', inputHeaderRowNumber),
        ////        bootstrapModal.gnrtDom('Measure unit row number', inputMeasureRowNumber),
        ////        bootstrapModal.gnrtDom('Data begin row number', inputDataBeginRowNumber)
        ////    );

        ////    // date format BEGIN
        ////    var selectOfDateFormat = document.createElement('select');
        ////    $(selectOfDateFormat).prop({ 'required': true });
        ////    var dateFormat = {
        ////        '': 'choose date format...',
        ////        'd-MMM-yy': '31-DEC-98',
        ////        'yyyy-MM-dd': '2013-12-31',
        ////        'M/d/yyyy': '12/31/2013',
        ////        'dd-MM-yyyy': '31-12-2013',
        ////        'MM-dd-yyyy': '12-31-2013'
        ////    };

        ////    for (var dateFormatKey in dateFormat) {
        ////        if (dateFormat.hasOwnProperty(dateFormatKey)) {
        ////            $(selectOfDateFormat).append(
        ////                $('<option></option>').val(dateFormatKey).html(dateFormatKey + ' (' + dateFormat[dateFormatKey] + ')')
        ////            );
        ////        }
        ////    }

        ////    if (self.Name().substr(self.Name().length - 4) === '.txt') {
        ////        $(innerDefineColumnDiv).append(
        ////                $('<div></div>').css({
        ////                    "height": "8px",
        ////                    "border-top": "1px dashed #555"
        ////                }),
        ////                bootstrapModal.gnrtDom('Date format', selectOfDateFormat)
        ////        );
        ////    }
        ////    // date format END

        ////    var defineColumnSubmitFunction = function () {
        ////        // get column attribute of this file
        ////        var urlQueryParams = {
        ////            well_id: self.WellId,
        ////            purpose: self.Purpose,
        ////            status: self.Status,
        ////            file_name: self.Name,
        ////            header_column_index: $(inputHeaderRowNumber).val(),
        ////            measure_column_index: $(inputMeasureRowNumber).val()
        ////        };

        ////        datacontext.getColumnAttributes(urlQueryParams).done(function (result) {
        ////            var columnAttributes = importColumnAttributesDto(result);

        ////            var needColumns = [
        ////                { Name: 'Date', IsRequired: true },
        ////                { Name: 'ProdDays', IsRequired: false },
        ////                { Name: 'OilRate', IsRequired: false },
        ////                { Name: 'WaterRate', IsRequired: false },
        ////                { Name: 'WaterCut', IsRequired: false },
        ////                { Name: 'GasRate', IsRequired: false },
        ////                { Name: 'OilCum', IsRequired: false },
        ////                { Name: 'GasCum', IsRequired: false },
        ////                { Name: 'WaterCum', IsRequired: false },
        ////                { Name: 'GOR', IsRequired: false },
        ////                { Name: 'LiquidRate', IsRequired: false },
        ////                { Name: 'LiquidCum', IsRequired: false }
        ////            ];

        ////            // create select with options
        ////            var selectOfColumnAttributes = document.createElement('select');
        ////            $(selectOfColumnAttributes).addClass('pd-parameter').append($('<option></option>').html('choose column...').val(''));

        ////            for (var caIndex = 0, caMaxIndex = columnAttributes.length; caIndex < caMaxIndex; caIndex++) {
        ////                var optionColumnAttribute = document.createElement('option');
        ////                $(optionColumnAttribute).val(columnAttributes[caIndex].Id).html(columnAttributes[caIndex].Name + (columnAttributes[caIndex].Format ? (', ' + columnAttributes[caIndex].Format) : ''));
        ////                $(selectOfColumnAttributes).append(optionColumnAttribute);
        ////            }
        ////            // ========= end creating

        ////            var innerDiv = document.createElement('div');
        ////            $(innerDiv).addClass('form-horizontal');
        ////            for (var columnIndex = 0; columnIndex < needColumns.length; columnIndex++) {
        ////                needColumns[columnIndex].SelectInput = $(selectOfColumnAttributes).clone();
        ////                if (needColumns[columnIndex].IsRequired === true) {
        ////                    $(needColumns[columnIndex].SelectInput).prop({ 'required': true });
        ////                }
        ////                // append select to block
        ////                $(innerDiv).append(bootstrapModal.gnrtDom(needColumns[columnIndex].Name, needColumns[columnIndex].SelectInput));
        ////            }

        ////            function submitFunction() {
        ////                ////var arrMatch = $(innerDiv).find('.pd-parameter').map(function (el) {
        ////                ////    return $(this).val();
        ////                ////}).get();

        ////                var needColumnListSelected = [];

        ////                for (var columnIndex = 0; columnIndex < needColumns.length; columnIndex++) {
        ////                    if ($(needColumns[columnIndex].SelectInput).val() !== '') {
        ////                        var needColumnItemSelected = {
        ////                            Id: $(needColumns[columnIndex].SelectInput).val(),
        ////                            Name: needColumns[columnIndex].Name
        ////                        };
        ////                        // add format for ProdDate
        ////                        if (needColumns[columnIndex].Name === 'Date') {
        ////                            needColumnItemSelected.Format = $(selectOfDateFormat).val();
        ////                        }
        ////                        needColumnListSelected.push(needColumnItemSelected);
        ////                    }
        ////                }

        ////                var urlQueryParams = {
        ////                    well_id: self.WellId,
        ////                    purpose: self.Purpose,
        ////                    status: self.Status,
        ////                    file_name: self.Name,
        ////                    is_import_pd: true,
        ////                    begin_row_index: parseInt($(inputDataBeginRowNumber).val(), 10) - 1
        ////                };

        ////                datacontext.importWellFileToPD(urlQueryParams, needColumnListSelected).done(function () {
        ////                    alert('Imported successfully: ' + self.Name());
        ////                    // TODO: message
        ////                });

        ////                bootstrapModal.closeModalWindow();
        ////            }

        ////            bootstrapModal.openModalWindow('Column match', innerDiv, submitFunction);
        ////        });
        ////    };

        ////    bootstrapModal.openModalWindow('Define row numbers', innerDefineColumnDiv, defineColumnSubmitFunction);
        ////};

        self.toPlainJson = function () { return ko.toJS(self); };
    }

    datacontext.createWellFile = function (data, parent) {
        return new WellFile(data, parent);
    };
});