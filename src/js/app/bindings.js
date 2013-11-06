define(['jquery', 'knockout', 'moment', 'jquery.slimscroll', 'jquery.bootstrap', 'bootstrap-datepicker'], function ($, ko, appMoment) {
    'use strict';

    // Hooks up a form to jQuery Validation
    ko.bindingHandlers.validate = {
        init: function (elem) {
            $(elem).validate();
        }
    };

    // Controls whether or not the text in a textbox is selected based on a model property
    ko.bindingHandlers.selected = {
        init: function (elem, valueAccessor) {
            $(elem).blur(function () {
                var boundProperty = valueAccessor();
                if (ko.isWriteableObservable(boundProperty)) {
                    boundProperty(false);
                }
            });
        },
        update: function (elem, valueAccessor) {
            var shouldBeSelected = ko.utils.unwrapObservable(valueAccessor());
            if (shouldBeSelected) {
                $(elem).select();
            }
        }
    };

    // Makes a textbox lose focus if you press "enter"
    ko.bindingHandlers.blurOnEnter = {
        init: function (elem) {
            $(elem).keypress(function (evt) {
                if (evt.keyCode === 13 /* enter */) {
                    evt.preventDefault();
                    $(elem).triggerHandler("change");
                    $(elem).blur();
                }
            });
        }
    };

    ko.bindingHandlers.placeholder = {
        init: function (elem, valueAccessor) {
            var placeholderText = ko.utils.unwrapObservable(valueAccessor()),
                input = $(elem);

            input.attr('placeholder', placeholderText);
        }
    };

    ko.bindingHandlers.date = {
        update: function (element, valueAccessor) {
            if (ko.unwrap(valueAccessor())) {
                element.innerHTML = appMoment(new Date(ko.unwrap(valueAccessor()))).format('YYYY-MM-DD');
            }
        }
    };

    ko.bindingHandlers.prec = {
        update: function (element, valueAccessor) {
            var p = ko.unwrap(valueAccessor().value);

            if ($.isNumeric(p) === false) {
                element.innerHTML = "";
                return;
            }

            p = p * valueAccessor().coef();

            if (p === 0) {
                element.innerHTML = 0;
            }
            else if (p < 1) {
                var i = 0;
                while (p < 1) {
                    i -= 1;
                    p *= 10;
                }

                element.innerHTML = String(Math.round(p * 100) / 100) + 'x10<sup>' + i + '</sup>';
            }
            else {
                element.innerHTML = String(Math.round(p * 100) / 100);
            }
        }
    };

    ko.bindingHandlers.scroller = {
        init: function (element) {
            // minus top block minus bottom block
            var needHeight = $(window).height() - 50 - 40;
            // 15 - col margin
            var needWidth = $(window).width() / 6 - 15;
            $(element).slimScroll({
                height: needHeight,
                width: needWidth,
                railVisible: true,
                alwaysVisible: true,
                color: '#fcfcfc',
                distance: '0px',
                // move page scroll with this scroll
                allowPageScroll: false
            });
        },
        update: function (element, valueAccessor) {
            var needHeight = valueAccessor().height() - 50 - 40;
            var needWidth;
            // 992px - small size in bootstrap
            if (valueAccessor().width() > 992) {
                needWidth = valueAccessor().width() / 6 - 15;
            }
            else {
                needWidth = valueAccessor().width() - 15;
            }

            $(element).parent().height(needHeight);
            $(element).height(needHeight);

            $(element).parent().width(needWidth);
            $(element).width(needWidth);

            ////console.log(needHeight);
            ////$(element).slimScroll({
            ////    height: needHeight,
            ////    railVisible: true,
            ////    alwaysVisible: true
            ////});
        }
    };

    ko.bindingHandlers.datepicker = {
        init: function (element, valueAccessor, allBindingsAccessor) {
            //initialize datepicker with some optional options
            var options = allBindingsAccessor().datepickerOptions || {};
            $(element).datepicker(options);

            //when a user changes the date, update the view model
            ko.utils.registerEventHandler(element, "changeDate", function (event) {
                var value = valueAccessor();
                if (ko.isObservable(value)) {
                    value(event.date);
                }
            });
        },
        update: function (element, valueAccessor) {
            var widget = $(element).data("datepicker");

            // When the view model is updated, update the widget
            if (widget) {

                widget.date = ko.utils.unwrapObservable(valueAccessor());
                if (widget.date) {
                    widget.setValue();
                }
            }
        }
    };

    // for bootstrap dropdown (wich not loaded correctly by data-toggle in external page)
    ko.bindingHandlers.drpdwn = {
        init: function (element) {
            $(element).dropdown();
        }
    };

    // for canvas log section
    ko.bindingHandlers.drawCnvsLog = {
        init: function (drawCnvs) {
            var startX = 0,
            startY = 0,
            lastX = 0,
            lastY = 0,
            isPainting = false;

            var drawCntx = drawCnvs.getContext('2d');
            drawCntx.strokeStyle = '#000';
            drawCntx.lineWidth = 0.5;

            $(drawCnvs).on('mousedown', function (e) {
                startX = e.pageX - $(this).offset().left;
                startY = e.pageY - $(this).offset().top;
                isPainting = true;
            }).on('mouseup', function (e) {
                // when mouseleave than 
                if (isPainting === true) {
                    lastX = e.pageX - $(this).offset().left;
                    lastY = e.pageY - $(this).offset().top;
                    drawCntx.clearRect(0, 0, drawCnvs.width, drawCnvs.height);
                    isPainting = false;
                    ////drawLineCntx(startX + $(this).offset().left, startY + $(this).offset().top, lastX + $(this).offset().left, lastY + $(this).offset().top);

                    require(['app/log-helper'], function (logHelper) {
                        logHelper.drawLineCntx(startX, startY, lastX, lastY);
                    });
                }
            }).on('mouseleave', function () {
                // cancel painting
                if (isPainting === true) {
                    drawCntx.clearRect(0, 0, drawCnvs.width, drawCnvs.height);
                    isPainting = false;
                }
            }).on('mousemove', function (e) {
                if (isPainting === true) {
                    lastX = e.pageX - $(this).offset().left;
                    lastY = e.pageY - $(this).offset().top;
                    drawCntx.clearRect(0, 0, drawCnvs.width, drawCnvs.height);
                    require(['app/log-helper'], function (logHelper) {
                        logHelper.drawLineCntxPart(drawCntx, startX, startY, lastX, lastY);
                    });
                }
            });
        }
    };

    // boostrap slider
    ko.bindingHandlers.sldr = {
        init: function (element, valueAccessor) {
            require(['bootstrap-slider'], function () {
                $(element).slider(valueAccessor());
            });
        }
    };

    // svg graph (like perfomance)
    ko.bindingHandlers.svgResponsive = {
        init: function (element, valueAccessor) {
            var ratio = ko.unwrap(valueAccessor().ratio);

            ////var elemStyle = getComputedStyle(element, '');
            ////console.log(elemStyle.width);

            var $elem = $(element);
            ////console.log('asdf3');
            ////console.log($elem.parent().width());

            function updateHeight() {
                //$elem.attr('height', hght);
                valueAccessor().tmpPrfGraphHeight($elem.parent().width() * ratio);
            }

            $(window).resize(function () {
                updateHeight();
            });

            updateHeight();
            // svg viewbox size need to init before creating of this element
        }
    };

    ko.bindingHandlers.svgAxisTime = {
        update: function (element, valueAccessor) {
            var timeBorder = ko.unwrap(valueAccessor().timeBorder);
            if ($.isNumeric(timeBorder[0]) && $.isNumeric(timeBorder[1])) {
                require(['d3'], function (d3) {
                    var t1 = new Date(timeBorder[0] * 1000),
                        t2 = new Date(timeBorder[1] * 1000);

                    var x = d3.time.scale()
                            .domain([t1, t2])
                            .range([t1, t2].map(d3.time.scale()
                            .domain([t1, t2])
                            .range([0, $(element).parent().width()])));

                    var axisX = d3.svg.axis().scale(x);

                    d3.select(element).select("g")
                            .call(axisX)
                            .selectAll("text")
                            .attr("y", 8)
                            .attr("x", -6)
                            .style("text-anchor", "start");
                });
            }
        }
    };

    ko.bindingHandlers.svgAxisValue = {
        update: function (element, valueAccessor) {
            var valueBorder = ko.unwrap(valueAccessor().valueBorder);

            if ($.isNumeric(valueBorder[0]) && $.isNumeric(valueBorder[1])) {
                require(['d3'], function (d3) {
                    var y = d3.scale.linear().range([$(element).height(), 0]);
                    // [123,123]
                    y.domain(valueBorder);

                    var axisY = d3.svg.axis().scale(y).orient('right');
                    d3.select(element).select('g')
                        .call(axisY)
                        .selectAll('text')
                        .attr('y', 0);
                });
            }
        }
    };
});