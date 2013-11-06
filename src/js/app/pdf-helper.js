define(['jquery', 'moment',
    'blob-js', 'blob-builder', 'filesaver'
    ////'jspdf', 'jspdf.plugin.addimage', 'jspdf.plugin.cell', 'jspdf.plugin.from_html', 'jspdf.plugin.ie_below_9_shim',
    ////'jspdf.plugin.javascript', 'jspdf.plugin.sillysvgrenderer', 'jspdf.plugin.split_text_to_size', 'jspdf.plugin.standard_fonts_metrics', 'jspdf.PLUGINTEMPLATE'
], function ($, appMoment) {
    'use strict';

    // milimeters per unit (for report)
    var mmInUnit = 1 / (72 / 25.4);

    // default settings for pdf page
    var pdfPage = {
        margin: 10, // mm
        widthUsed: 190, // full - 210 mm
        heightUsed: 277, // full - 297 mm
        lineHeight: 4, // mm
        fontSize: { // pixels
            xsmall: 8,
            small: 12,
            medium: 16,
            large: 20,
            xlarge: 24
        }
    };

    // include both month
    function monthDiff(d1, d2) {
        var months = (d2.getFullYear() - d1.getFullYear()) * 12;
        months -= d1.getMonth();
        months += d2.getMonth() + 1;
        return months <= 0 ? 0 : months;
    }

    var pdfHelper = {};

    // return height of text
    pdfHelper.addHeaderToPdfDoc = function (pdfDoc, headerText) {
        pdfDoc.setFontSize(pdfPage.fontSize.large);

        var headerTextWidth = (pdfDoc.getStringUnitWidth(headerText) * pdfPage.fontSize.large) * mmInUnit;
        pdfDoc.text(pdfPage.margin + (pdfPage.widthUsed - headerTextWidth) / 2, pdfPage.margin, headerText);
        return pdfPage.fontSize.large * mmInUnit;
    };

    pdfHelper.getImgDataFromCanvas = function (img, offsetX, offsetY, width, height) {
        var canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        //   document.body.appendChild(canvas);

        var ctx = canvas.getContext('2d');
        ctx.drawImage(img, offsetX, offsetY, width, height, 0, 0, width, height);
        // Grab the image as a jpeg encoded in base64, but only the data
        var result = canvas.toDataURL('image/jpeg').slice('data:image/jpeg;base64,'.length);
        // Convert the data to binary form
        result = atob(result);
        //  document.body.removeChild(canvas);

        return result;
    };

    pdfHelper.drawGraphLabelInPdf = function (pdfDoc, headerList) {
        var startY = pdfPage.margin + 20;
        var coef = pdfPage.widthUsed / 4;
        pdfDoc.setFontSize(pdfPage.fontSize.xsmall);
        $.each(headerList, function (elemIndex, elemValue) {
            if (elemValue.IsCalc() === false) {
                pdfDoc.setTextColor(elemValue.curveColor[0], elemValue.curveColor[1], elemValue.curveColor[2]);
                pdfDoc.text(elemValue.Name + ', ' + elemValue.Format(), pdfPage.margin + elemIndex * coef, startY);
            }
        });
    };

    pdfHelper.drawGraphDataInPdf = function (pdfDoc, graphData, headerList) {
        var startY = pdfPage.margin + 30;

        pdfDoc.setTextColor(0, 0, 0);
        var graphHeight = parseInt(pdfPage.heightUsed / 2, 10);
        // get width of graph
        // if we'll count by record count and some date will be null, then uncorrect

        var firstDate = graphData[0][0];
        var lastDate = graphData[graphData.length - 1][0];

        var horizontalCount = monthDiff(firstDate, lastDate);

        var horizontalModulusForText = parseInt(horizontalCount / 5, 10);
        var horizontalModulusForDash = parseInt(horizontalCount / 10, 10);

        var horizontalScale = pdfPage.widthUsed / (horizontalCount - 1);

        var counterDate = new Date(firstDate);
        var monthIndex = 0;

        pdfDoc.setDrawColor(0, 0, 0);
        pdfDoc.setFontSize(pdfPage.fontSize.xsmall);

        pdfDoc.line(pdfPage.margin, startY + graphHeight, pdfPage.margin + pdfPage.widthUsed, startY + graphHeight);
        while (counterDate < lastDate) {
            if (monthIndex % horizontalModulusForDash === 0) {
                pdfDoc.line(pdfPage.margin + horizontalScale * monthIndex, startY + graphHeight - 2, pdfPage.margin + horizontalScale * monthIndex, startY + graphHeight + 2);
            }

            if (monthIndex % horizontalModulusForText === 0) {
                pdfDoc.text(appMoment(counterDate).format('YYYY-MM'), pdfPage.margin + horizontalScale * monthIndex - 4, startY + graphHeight + 8);
            }

            monthIndex += 1;
            counterDate = new Date(counterDate.setMonth(counterDate.getMonth() + 1));
        }

        // vertical data 
        // get min and max values (exclude zero index - date)
        var minValue = 0;
        var maxValue = graphData[0][1];
        $.each(graphData, function (elemIndex, elemValue) {
            $.each(elemValue, function (innerIndex, innerValue) {
                if (innerIndex > 0) {
                    if (innerValue > maxValue) { maxValue = innerValue; }
                    if (innerValue < minValue) { minValue = innerValue; }
                }
            });
        });

        var verticalCoef = graphHeight / (maxValue - minValue); // mm / bbl

        // draw vertical dash
        pdfDoc.setDrawColor(0, 0, 0);
        pdfDoc.line(pdfPage.margin, startY, pdfPage.margin, startY + graphHeight);

        var grStep = Math.pow(10, ((maxValue - minValue) / 20).toFixed(0).length);

        for (var ti = minValue; ti < maxValue; ti += grStep) {
            var vertY = startY + graphHeight - ti * verticalCoef;
            pdfDoc.line(pdfPage.margin - 2, vertY, pdfPage.margin + 2, vertY);
            pdfDoc.text((ti).toFixed(0), pdfPage.margin - 9, vertY - 1);
        }

        // from min to max element
        for (var ik = 1; ik < graphData.length; ik += 1) {
            var coordX = pdfPage.margin + (ik - 1) * horizontalScale;
            var coordToX = pdfPage.margin + ik * horizontalScale;

            for (var jk = 1; jk < graphData[ik].length; jk += 1) {
                // rgb color
                var needColor = headerList[jk - 1].curveColor;
                pdfDoc.setDrawColor(needColor[0], needColor[1], needColor[2]);
                var coordY = startY + graphHeight - (graphData[ik - 1][jk]) * verticalCoef; // bbl * mm/bbl
                var coordToY = startY + graphHeight - (graphData[ik][jk]) * verticalCoef; // bbl * mm/bbl
                pdfDoc.line(coordX, coordY, coordToX, coordToY);
            }
        }
    };

    pdfHelper.createPdf = function () {
        // client pdf generation (A4 - 210x297mm)
        return new jsPDF();
    };

    pdfHelper.writeFileHeader = function (doc, summaryStringPosition, strHeader) {
        // header
        var fontSize = pdfPage.fontSize.xlarge;
        doc.setFontSize(fontSize);
        summaryStringPosition += pdfPage.margin + (fontSize * mmInUnit);
        ////var actualTextWidth = doc.getStringUnitWidth(text, {fontName:'Times', fontStyle:'Roman'}) * fontSizeInPoints  / toYourUnitsScaleRatio
        var strHeaderWidth = (doc.getStringUnitWidth(strHeader) * fontSize) * mmInUnit;
        doc.text(pdfPage.margin + (pdfPage.widthUsed - strHeaderWidth) / 2, summaryStringPosition, strHeader);

        return summaryStringPosition;
    };

    pdfHelper.writeHeaderDate = function (doc, summaryStringPosition, strDate) {
        var fontSize = pdfPage.fontSize.small;
        doc.setFontSize(fontSize);
        var strDateWidth = (doc.getStringUnitWidth(strDate) * fontSize) * mmInUnit;
        summaryStringPosition += pdfPage.lineHeight + fontSize * mmInUnit;
        doc.text(pdfPage.margin + (pdfPage.widthUsed - strDateWidth) / 2, summaryStringPosition, strDate);

        return summaryStringPosition;
    };

    pdfHelper.savePdf = function (doc, outputFileName) {
        ////doc.output('datauri');
        doc.save(outputFileName);
    };

    pdfHelper.writeLogoImage = function (doc, summaryStringPosition, logoData) {
        var logoWidth = pdfPage.widthUsed / 5;
        var coefLogo = logoWidth / (logoData.width * mmInUnit);
        var logoHeight = logoData.height * mmInUnit * coefLogo;

        doc.addImage(logoData.data, 'JPEG', pdfPage.margin, pdfPage.margin, logoWidth, logoHeight);
        summaryStringPosition = Math.max(summaryStringPosition, logoHeight);

        return summaryStringPosition;
    };

    pdfHelper.writeWellName = function (doc, summaryStringPosition, wellName) {
        var fontSize = pdfPage.fontSize.large;
        doc.setFontSize(fontSize);
        doc.setFontType("bold");
        var strNameWidth = (doc.getStringUnitWidth(wellName) * fontSize) * mmInUnit;
        summaryStringPosition += pdfPage.lineHeight + fontSize * mmInUnit;
        doc.text(pdfPage.margin + (pdfPage.widthUsed - strNameWidth) / 2, summaryStringPosition, wellName);

        return summaryStringPosition;
    };

    pdfHelper.writeMap = function (doc, imgMapData, headerTitle, arrWellInWellFieldMaps, arrWellFieldMapAreas) {
        doc.addPage();

        var mapStringPosition = pdfHelper.addHeaderToPdfDoc(doc, headerTitle);
        mapStringPosition += pdfPage.lineHeight;

        var imgMapWidth = imgMapData[0].width * mmInUnit;
        var coefMap = 1;
        if (imgMapWidth > pdfPage.widthUsed) {
            coefMap = pdfPage.widthUsed / imgMapWidth;
            imgMapWidth = pdfPage.widthUsed;
        }

        doc.addImage(imgMapData[0].data, 'JPEG', pdfPage.margin, mapStringPosition, imgMapWidth, imgMapData[0].height * mmInUnit * coefMap);

        $.each(arrWellInWellFieldMaps, function (elemIndex, elemValue) {
            doc.setLineWidth(1);
            doc.setDrawColor(0, 0, 255);
            doc.setFillColor(255, 255, 255);
            var circleX = elemValue.coordX() * mmInUnit * coefMap + pdfPage.margin;
            var circleY = elemValue.coordY() * mmInUnit * coefMap + mapStringPosition;
            doc.circle(circleX, circleY, 1, 'FD');
            var wellItem = elemValue.getWell();
            if (wellItem) {
                doc.setFontSize(pdfPage.fontSize.xsmall);
                doc.text(circleX - 4, circleY - 2, wellItem.Name());
            }
        });

        doc.setLineWidth(0.5);
        doc.setDrawColor(0, 0, 255);

        ////doc.triangle(100, 100, 200, 100, 300, 200, 'FD');
        ////doc.lines([[20, 20], [20, 60], [60, 60], [60, 20]], 0, 0, 1);

        $.each(arrWellFieldMapAreas, function (elemIndex, elemValue) {
            var coordsArr = elemValue.coordsFromTopLeft();
            for (var i = 0, ilimit = coordsArr.length; i < ilimit - 1; i += 1) {
                doc.line(coordsArr[i][0] * mmInUnit * coefMap + pdfPage.margin, coordsArr[i][1] * mmInUnit * coefMap + mapStringPosition, coordsArr[i + 1][0] * mmInUnit * coefMap + pdfPage.margin, coordsArr[i + 1][1] * mmInUnit * coefMap + mapStringPosition); // vertical line
            }

            ////var areaArr = [];
            ////$.each(elemValue.coordsFromTopLeft(), function (coordIndex, coordValue) {
            ////    var tempX = coordValue[0], tempY = coordValue[1];
            ////    tempX = tempX * mmInUnit * coefMap + pdfPage.margin;
            ////    tempY = tempY * mmInUnit * coefMap + pdfPage.margin;
            ////    areaArr.push([tempX, tempY]);
            ////});

            ////doc.lines(areaArr, 0, 0, [1, 1], 'FD');
            ////doc.lines(areaArr, 0, 0, 'FD');
            ////$.each(elemValue.coordsTopLeft(), function (coordIndex, coordValue) {
            ////    doc.
            ////});
        });
    };

    pdfHelper.writeHistory = function (doc, headerTitle, innSortedHistoryList) {
        doc.addPage();

        // history header
        var historyHeaderHeight = pdfHelper.addHeaderToPdfDoc(doc, headerTitle);
        var stringPosition = pdfPage.margin + historyHeaderHeight; //in pixels (in units) - convert to mm
        // history list
        var fontSize = pdfPage.fontSize.small;
        doc.setFontSize(fontSize);
        $.each(innSortedHistoryList, function (elemIndex, elemValue) {
            var historyDateText = appMoment(elemValue.StartDate()).format('YYYY-MM-DD');
            if (elemValue.StartDate() !== elemValue.EndDate()) {
                historyDateText += ' to ' + appMoment(elemValue.EndDate()).format('YYYY-MM-DD');
            }

            // place history date as bold
            doc.setFontType('bold');

            stringPosition += pdfPage.lineHeight + fontSize * mmInUnit;

            doc.setDrawColor(0);
            doc.setFillColor(199, 252, 236);
            doc.roundedRect(pdfPage.margin, stringPosition - fontSize * mmInUnit - 1, pdfPage.widthUsed, fontSize * mmInUnit + 3, 1, 1, 'FD'); //  Black sqaure with rounded corners

            doc.text(pdfPage.margin + 2, stringPosition, historyDateText);

            // history text

            if (elemValue.History()) {
                doc.setFontType('normal');
                var splittedHistoryText = doc.splitTextToSize(elemValue.History(), pdfPage.widthUsed);
                $.each(splittedHistoryText, function (strIndex, strValue) {
                    stringPosition += pdfPage.lineHeight + fontSize * mmInUnit;
                    if (stringPosition > pdfPage.heightUsed) {
                        doc.addPage();
                        stringPosition = pdfPage.margin;
                    }

                    doc.text(pdfPage.margin, stringPosition, strValue);
                });
            }

            $.each(elemValue.WfmImages(), function (imgIndex, imgValue) {
                var historyImg = new Image();
                historyImg.src = imgValue.dataUrl;

                var historyImgUrlData = pdfHelper.getImgDataFromCanvas(historyImg, 0, 0, historyImg.width, historyImg.height);

                var historyImgRatio = 1;
                if (historyImg.width > pdfPage.widthUsed) {
                    historyImgRatio = pdfPage.widthUsed / historyImg.width;
                }

                if (stringPosition > pdfPage.heightUsed) {
                    doc.addPage();
                    stringPosition = pdfPage.margin;
                }

                doc.addImage(historyImgUrlData, 'JPEG', pdfPage.margin, stringPosition, (historyImg.width * historyImgRatio), historyImg.height * historyImgRatio);
                // image draws from top-left coords
                // text from bottom-left
                stringPosition += historyImg.height * historyImgRatio;
            });

            // add margin and line after every history record
            ////stringPosition += pdfPage.lineHeight;
            ////doc.setDrawColor(128, 128, 128);
            ////doc.line(pdfPage.margin, stringPosition, pdfPage.widthUsed + pdfPage.margin, stringPosition);

        });
    };

    pdfHelper.writeLog = function (doc, imgLogData, headerTitle) {
        $.each(imgLogData, function (elemIndex, elemValue) {
            doc.addPage();

            var imgLogWidth = elemValue.width * mmInUnit; // pixel to mm
            var coefLog = 1;
            if (imgLogWidth > pdfPage.widthUsed) {
                coefLog = pdfPage.widthUsed / imgLogWidth;
            }

            var logStartY = pdfPage.margin;
            if (elemIndex === 0) {
                logStartY = logStartY + pdfHelper.addHeaderToPdfDoc(doc, headerTitle);
            }

            doc.addImage(elemValue.data, 'JPEG', pdfPage.margin, logStartY, elemValue.width * mmInUnit * coefLog, elemValue.height * mmInUnit * coefLog);
        });
    };

    pdfHelper.writePd = function (doc, elemValue, arrPd, headerList) {
        doc.addPage();
        var pdStringPosition = pdfPage.margin;
        pdStringPosition += pdfHelper.addHeaderToPdfDoc(doc, 'Perfomance: ' + elemValue + ' table') + pdfPage.lineHeight;
        pdStringPosition += pdfPage.lineHeight;
        pdfHelper.addPdTableToPdf(doc, pdStringPosition, arrPd, headerList);
        doc.addPage();
        // write data
    };

    pdfHelper.addPdTableToPdf = function (pdfDoc, pdStringPosition, arrPd, headerList) {
        pdfDoc.setFontSize(pdfPage.fontSize.small);
        var columnWidth = pdfPage.widthUsed / 5;

        // add column headers
        pdfDoc.setFontType("bold");
        var columnNumber = 1;
        pdfDoc.text(pdfPage.margin, pdStringPosition, 'Date');
        $.each(headerList, function (elemIndex, elemValue) {
            if (elemValue.IsCalc() === false) {
                pdfDoc.text(pdfPage.margin + columnWidth * columnNumber, pdStringPosition, elemValue.Name);
                columnNumber += 1;
            }
        });

        pdStringPosition += pdfPage.fontSize.small * mmInUnit + pdfPage.lineHeight;

        // add column headers
        pdfDoc.setFontType("italic");
        columnNumber = 1;
        $.each(headerList, function (elemIndex, elemValue) {
            if (elemValue.IsCalc() === false) {
                pdfDoc.text(pdfPage.margin + columnWidth * columnNumber, pdStringPosition, elemValue.Format());
                columnNumber += 1;
            }
        });

        pdStringPosition += pdfPage.fontSize.small * mmInUnit + pdfPage.lineHeight;
        pdfDoc.setFontType("normal");
        $.each(arrPd, function (elemIndex, elemValue) {
            // Milliseconds between the date object and midnight January 1 1970
            var oadateString = appMoment((parseFloat(elemValue.Id) - 25569) * 24 * 3600 * 1000).format('YYYY-MM');
            pdfDoc.text(pdfPage.margin, pdStringPosition, oadateString);

            // TODO: restore without using self
            ////$.each(headerList, function (headerIndex, headerValue) {
            ////    if (headerValue.IsCalc() === false) {
            ////        if (elemValue[headerValue.Name] !== null) {
            ////            pdfDoc.text(pdfPage.margin + columnWidth * (headerIndex + 1), pdStringPosition, String(Math.round((elemValue[headerValue.Name] * self['coef' + headerValue.Name]()) * 100) / 100));
            ////        }
            ////        else if (typeof elemValue['Calc' + headerValue.Name] !== 'undefined' && elemValue['Calc' + headerValue.Name]() !== null) {
            ////            pdfDoc.text(pdfPage.margin + columnWidth * (headerIndex + 1), pdStringPosition, '[' + String(Math.round((elemValue['Calc' + headerValue.Name]() * self['coefCalc' + headerValue.Name]()) * 100) / 100) + ']');
            ////        }
            ////    }
            ////});

            pdStringPosition += pdfPage.fontSize.small * mmInUnit + pdfPage.lineHeight;
            if (pdStringPosition > pdfPage.heightUsed) {
                pdfDoc.addPage();
                pdStringPosition = pdfPage.margin;
            }
        });
    };

    pdfHelper.addSummaryFieldToPdf = function (pdfDoc, title, content, stringPosition) {
        if (content) {
            var fontSize = pdfPage.fontSize.medium;
            pdfDoc.setFontSize(fontSize);

            var splittedText = pdfDoc.splitTextToSize(content, pdfPage.widthUsed);
            // if (title + content).height > page height
            if (((splittedText.length - 1) * fontSize * mmInUnit + pdfPage.lineHeight + fontSize * mmInUnit) + stringPosition > pdfPage.heightUsed) {

                pdfDoc.addPage();
                stringPosition = pdfPage.margin;
            }

            stringPosition += pdfPage.lineHeight + fontSize * mmInUnit;

            pdfDoc.setFontType("bold");
            pdfDoc.text(pdfPage.margin, stringPosition, title);

            stringPosition += pdfPage.lineHeight + fontSize * mmInUnit;
            pdfDoc.setFontType("normal");
            pdfDoc.text(pdfPage.margin, stringPosition, splittedText);
            stringPosition += (splittedText.length - 1) * fontSize * mmInUnit;
        }

        return stringPosition;
    };

    pdfHelper.getImageFromUrl = function (url, callback) {
        // check callback - necessary param
        if ($.isFunction(callback) === false) {
            throw new Error('Need callback function');
        }

        if (url === null) {
            callback([]);
            return;
        }

        var img = new Image();

        img.onerror = function () {
            callback([]);
        };

        img.onload = function () {
            // inner data: 
            // img.width
            // img.height

            // ratio
            var imgScaleCoef = 1;

            // img 700*900
            // pdf 400*600
            // if 700 > 400 
            // scale = 400/700
            // height = 900 * 400/700
            // width = 700 * 400/700
            if (img.width > (pdfPage.widthUsed / mmInUnit)) {
                imgScaleCoef = (pdfPage.widthUsed / mmInUnit) / img.width;
            }

            // height of image compressed in need width
            var scaleHeight = img.height * imgScaleCoef; // in pixels

            var usedHeight = 0;
            var imgData = [];
            // if image height greater than page height then clip to parts
            while (usedHeight < scaleHeight) {
                // height of image pulling in one page
                var partHeight = Math.min(scaleHeight - usedHeight, pdfPage.heightUsed / mmInUnit);

                imgData.push({
                    width: img.width,
                    height: partHeight / imgScaleCoef,
                    data: pdfHelper.getImgDataFromCanvas(img, 0, usedHeight / imgScaleCoef, img.width, partHeight / imgScaleCoef)
                });

                // leave height of image for next pages
                usedHeight = usedHeight + partHeight;
            }

            ////if (needHeight > maxHeight) {
            ////    needHeight = maxHeight;
            ////}

            ////var canvas = document.createElement('canvas');
            ////document.body.appendChild(canvas);
            ////canvas.width = imgData.width = img.width;
            ////canvas.height = imgData.height = needHeight;

            ////var ctx = canvas.getContext('2d');
            ////ctx.drawImage(img, 0, 0);
            ////// Grab the image as a jpeg encoded in base64, but only the data
            ////imgData.data = canvas.toDataURL('image/jpeg').slice('data:image/jpeg;base64,'.length);
            ////// Convert the data to binary form
            ////imgData.data = atob(imgData.data);
            ////document.body.removeChild(canvas);

            callback(imgData);
        };

        img.src = url;
    };

    pdfHelper.writeSketchImg = function (doc, sketchBase64, headerTitle) {
        $.each(sketchBase64, function (elemIndex, elemValue) {
            doc.addPage();
            var sketchStringPosition = pdfHelper.addHeaderToPdfDoc(doc, headerTitle);
            sketchStringPosition += pdfPage.lineHeight;
            var imgSketchWidth = elemValue.width * mmInUnit;
            var coefSketch = 1;
            if (imgSketchWidth > pdfPage.widthUsed) {
                coefSketch = pdfPage.widthUsed / imgSketchWidth;
                imgSketchWidth = pdfPage.widthUsed;
            }

            doc.addImage(elemValue.data, 'JPEG', pdfPage.margin, sketchStringPosition, imgSketchWidth, elemValue.height * mmInUnit * coefSketch);
        });
    };

    pdfHelper.writeSketchDesc = function (doc, sketchDescHtml, sketchDescTitle) {
        doc.addPage();
        var sketchDescStringPos = pdfHelper.addHeaderToPdfDoc(doc, sketchDescTitle);
        sketchDescStringPos += pdfPage.lineHeight;

        doc.fromHTML(sketchDescHtml, pdfPage.margin, sketchDescStringPos, {
            'width': pdfPage.widthUsed,
            'elementHandlers': {}
        });
    };

    return pdfHelper;
});