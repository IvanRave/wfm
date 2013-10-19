define(['jquery'], function ($) {
    'use strict'

    $(function () {
        if ($('html.lt-ie8').length === 0) {
            require(['ajaxupload/cors/jquery.xdr-transport']);
            // The XDomainRequest Transport is included for cross-domain file deletion for IE8+ 
            ////<!--[if gte IE 8]><script src="~/scripts/ajaxupload/cors/jquery.xdr-transport.js"></script><![endif]-->
        }

        require(['ajaxupload/cors/jquery.postmessage-transport']);
    });
});