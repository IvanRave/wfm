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

            // Add one trailing slash whether url slash exists or not
            currentPath = currentPath + '/';

            switch (currentPath) {
                case '/':
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
                case '/workspace/company/':
                    // {{#if conf.isProd}}
                    require(['jquery', 'app/workspace/project-bundle-{{package.version}}.min']);
                    // {{else}}
                    require(['jquery', 'app/workspace/project']);
                    // {{/if}}

                    return;
                case '/company/':
                    require(['jquery', 'angular', 'app/cabinet/project', 'jquery.bootstrap'], function ($, angular, cabinetProject) {
                        // Using jQuery dom ready because it will run this even if DOM load already happened
                        $(function () {
                            angular.bootstrap(document.getElementById('cabinet-project-wrap'), [cabinetProject.name]);
                        });
                    });

                    return;
                case '/admin/':
                    require(['jquery', 'angular', 'app/admin/project', 'jquery.bootstrap'], function ($, angular, adminProject) {
                        $(function () {
                            angular.bootstrap(document.getElementById('admin-project-wrap'), [adminProject.name]);
                        });
                    });

                    return;
                case '/pricing/calculator/':
                    require(['jquery', 'jquery.bootstrap', 'app/calculator/project']);
                    return;
                case '/httpinfo/': return;
                case '{{syst.logon_url}}':
                    require(['jquery', 'angular', 'app/account/logon/project'], function ($, angular, logonProject) {
                        $(function () {
                            var logonProjectWrap = document.getElementById('logon-project-wrap');
                            angular.bootstrap(logonProjectWrap, [logonProject.name]);
                            $(logonProjectWrap).removeClass('hide');
                        });
                    });
                    return;
                case '{{syst.logoff_url}}':
                    require(['app/datacontext'], function (appDatacontext) {
                        // Remove AUTH httponly cookie and is_auth cookie
                        appDatacontext.accountLogoff().done(function () {
                            cookieHelper.removeCookie('{{syst.cookie_is_auth}}');
                            // After logoff navigate to the main page
                            window.location.href = '/';
                        });
                    });
                    return;
                default:
                    require(['jquery.bootstrap']);
                    return;
            }
        });
    });
});

