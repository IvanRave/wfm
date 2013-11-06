require(['require-config'], function () {
    'use strict';

    // Show or hide login info
    require(['app/auth-logic']);

    require(['jquery', 'jquery.bootstrap'], function ($) {
        $(function () {
            var jqrCarouselWfm = $('#carousel-wfm');

            var itemArr = jqrCarouselWfm.find('.item');

            var i = 0,
                iMax = 2;
            $(itemArr[i]).find('img').prop('src', 'img/carousel-wfm-' + (i + 1) + '.jpg');
            jqrCarouselWfm.carousel();

            i += 1;
            jqrCarouselWfm.on('slide.bs.carousel', function () {
                $(itemArr[i]).find('img').prop('src', 'img/carousel-wfm-' + (i + 1) + '.jpg');

                if (i === iMax) {
                    jqrCarouselWfm.off('slide.bs.carousel');
                } else {
                    i += 1;
                }
            });
        });
    });
});