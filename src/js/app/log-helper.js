define(['jquery'], function ($) {

    // ============================log canvas
    var logHelper = {
        isArrowXorLine: true
    };

    logHelper.drawLineCntxPart = function (cntx, startX, startY, lastX, lastY) {
        var arrowHeadLength = 10;
        cntx.beginPath();
        cntx.moveTo(startX, startY);
        cntx.lineTo(lastX, lastY);
        if (logHelper.isArrowXorLine === true) {
            var angle = Math.atan2(lastY - startY, lastX - startX);
            cntx.lineTo(lastX - arrowHeadLength * Math.cos(angle - Math.PI / 6), lastY - arrowHeadLength * Math.sin(angle - Math.PI / 6));
            cntx.moveTo(lastX, lastY);
            cntx.lineTo(lastX - arrowHeadLength * Math.cos(angle + Math.PI / 6), lastY - arrowHeadLength * Math.sin(angle + Math.PI / 6));
        }

        cntx.stroke();
    };

    logHelper.drawTextCntxPart = function (cntx, textString, startX, startY) {
        cntx.textAlign = 'start';
        cntx.textBaseline = 'middle';
        cntx.font = 'normal 12px sans-serif';
        cntx.fillText(textString, startX, startY);
    };

    logHelper.drawLineCntx = function (startX, startY, lastX, lastY) {
        var cnvs = document.getElementById('log_cnvs');
        var cntx = cnvs.getContext('2d');
        cntx.strokeStyle = '#000';
        cntx.lineWidth = 0.5;
        logHelper.drawLineCntxPart(cntx, startX, startY, lastX, lastY);
    };

    logHelper.drawTextCntx = function (textString, startX, startY) {
        var cnvs = document.getElementById('log_cnvs');
        var cntx = cnvs.getContext('2d');
        logHelper.drawTextCntxPart(cntx, textString, startX, startY);
    };

    logHelper.drawText = function (posX, posY, drawTextBlock) {
        var podl = document.createElement('span');
        $(podl).css({
            'position': 'absolute',
            'top': (posY - 9),
            'left': posX,
            'white-space': 'nowrap',
            'color': '#888',
            'font-size': '12px',
            'font-family': 'sans-serif',
            'z-index': '15'
        }).html('enter text...');

        var pTag = document.createElement('span');
        $(pTag).prop({ 'contenteditable': true }).css({
            'position': 'absolute',
            'top': (posY - 9),
            'left': posX,
            'white-space': 'nowrap',
            'font-size': '12px',
            'font-family': 'sans-serif',
            'z-index': '15'
        }).on('keypress', function (e) {
            var code = (e.keyCode ? e.keyCode : e.which);
            // Enter keycode
            if (code === 13) {
                e.preventDefault();
                var s = $(pTag).html();
                $(podl).remove();
                $(pTag).remove();
                logHelper.drawTextCntx(s, posX, posY);
            }
        }).on('keyup', function (e) {
            var s = $(pTag).html();

            if (s.length === 0) {
                $(podl).show();
            }
            else {
                $(podl).hide();
            }

            var code = (e.keyCode ? e.keyCode : e.which);
            if (code === 27) {
                $(podl).remove();
                $(pTag).remove();
            }
        }).on('focusout', function () {
            $(podl).remove();
            $(pTag).remove();
        });

        $(drawTextBlock).append(podl, pTag);
        $(pTag).focus();
    };

    return logHelper;
});