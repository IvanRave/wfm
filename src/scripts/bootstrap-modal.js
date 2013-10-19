define(['jquery', 'jquery.bootstrap'], function ($) {
    'use strict';

    var bootstrapModal = {};

    bootstrapModal.gnrtDom = function (labelName, elementDom, helpInline) {
        var innerDiv = document.createElement('div');

        $(innerDiv).addClass("form-group").append(
            $('<label></label>').addClass("control-label col-md-3").html(labelName),
            $('<div></div>').addClass("col-md-6").append(elementDom),
            $('<div></div>').addClass("col-md-3").append($('<span></span>').html(helpInline || '').addClass('help-block'))
        );

        return innerDiv;
    };
    // ========== standard =======================
    bootstrapModal.closeModalWindow = function () {
        // Without removing inner data
        $('#modal-standard-block').modal('hide');
    };

    bootstrapModal.openModalWindow = function (headerName, bodyDom, submitFunction) {
        var $modalStandardBlock = $('#modal-standard-block');

        $modalStandardBlock.find('.modal-body').html(bodyDom);
        $modalStandardBlock.find('#modal-standard-form').off("submit").on("submit", function () {
            submitFunction();
            return false;
        });

        $modalStandardBlock.find('.modal-close').off("click").on("click", bootstrapModal.closeModalWindow);

        $modalStandardBlock.find('.modal-title').html(headerName);
        $modalStandardBlock.modal('show');
    };

    // =================== wide ===============================
    bootstrapModal.closeModalWideWindow = function () {
        $('#modal-wide-block').modal('hide');
    };

    bootstrapModal.openModalWideWindow = function (bodyDom, submitFunction) {
        var $modalWideBlock = $('#modal-wide-block');
        $modalWideBlock.find('.modal-body').html(bodyDom);
        $modalWideBlock.find('.modal-ok').off("click").on("click", function () {
            submitFunction();
            return false;
        });

        $modalWideBlock.find('.modal-close').off("click").on("click", bootstrapModal.closeModalWideWindow);

        $modalWideBlock.modal('show');
    };

    return bootstrapModal;
});