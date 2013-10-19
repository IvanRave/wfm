// Do the require calls here instead of
// a separate file so after a build there are only 2 HTTP requests instead of three.
require(['../require-config'], function () {
    // Load main modules (for all pages) after load require configuration
    require(['dom-ready', 'app/cookie-helper', 'compability-fix'], function (domReady, cookieHelper) {
        domReady(function () {

            var isAuth = false;

            // Hide private members
            (function () {
                // Can not read HTTPONLY cookies
                // Read is_auth cookie
                // is_auth and .ASPXAUTH cookies stores simultaneously
                // Every page check user auth
                // Cookie name stores in assemble_store/data/syst.json
                if (cookieHelper.getCookie('{{syst.cookie_is_auth}}')) {
                    isAuth = true;
                    document.getElementById('logoff_block').style.display = "block";
                }
                else {
                    document.getElementById('logon_block').style.display = "block";
                }
            })();

            // Router: different js for diff pages
            var currentPath = window.location.pathname.toLowerCase();

            // Remove index.html
            currentPath = currentPath.replace(/index.html/, '');

            // Remove trailing slashes if exists
            currentPath = currentPath.replace(/\/+$/, '');

            if (currentPath === '') {
                if (isAuth) {
                    // Redirect auth users to their company list
                    window.location.href = "/company/";
                    return;
                }
                require(['jquery', 'dom-ready', 'jquery.bootstrap'], function ($, domReady) {
                    domReady(function () {
                        var jqrCarouselWfm = $('#carousel-wfm');

                        var itemArr = jqrCarouselWfm.find('.item');

                        var i = 0,
                            iMax = 2;
                        $(itemArr[i]).find('img').prop('src', '/img/carousel-wfm-' + (i + 1) + '.jpg');

                        jqrCarouselWfm.carousel();

                        i += 1;
                        jqrCarouselWfm.on('slide.bs.carousel', function () {
                            $(itemArr[i]).find('img').prop('src', '/img/carousel-wfm-' + (i + 1) + '.jpg');

                            if (i === iMax) {
                                jqrCarouselWfm.off('slide.bs.carousel');
                            } else {
                                i += 1;
                            }
                        });
                    });
                });
                return;
            }

            // wfm workspace
            if (/^\/workspace\/company\/[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(currentPath)) {
                // production mode:
                require(['jquery', 'app/workspace/project-bundle-{{package.version}}.min']);
                // debug mode: 
                /////require(['jquery', 'app/workspace/project']);
                return;
            }

            // company/index
            if (currentPath === '/company' || currentPath === '/company/index') {
                require(['jquery', 'angular', 'app/cabinet/project', 'jquery.bootstrap'], function ($, angular, cabinetProject) {
                    // Using jQuery dom ready because it will run this even if DOM load already happened
                    $(function () {
                        angular.bootstrap(document.getElementById('cabinet-project-wrap'), [cabinetProject.name]);
                    });
                });

                return;
            }

            // admin
            if (currentPath === '/admin' || currentPath === '/admin/index') {
                require(['jquery', 'angular', 'app/admin/project', 'jquery.bootstrap'], function ($, angular, adminProject) {
                    $(function () {
                        angular.bootstrap(document.getElementById('admin-project-wrap'), [adminProject.name]);
                    });
                });

                return;
            }

            // calculator
            if (currentPath === '/pricing/calculator') {
                require(['jquery', 'jquery.bootstrap', 'app/calculator/project']);
                return;
            }

            if (currentPath === '/httpinfo') {

            }

            if (currentPath === '/logon') {
                require(['jquery', 'angular', 'app/logon/project'], function ($, angular, logonProject) {
                    $(function () {
                        angular.bootstrap(document.getElementById('logon-project-wrap'), [logonProject.name]);
                    });
                });
            }

            // for other pages
            require(['jquery.bootstrap']);
        });
    });
});

