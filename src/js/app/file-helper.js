define(['jquery', 'jquery.fileupload'], function ($) {
    'use strict';

    return {
        initFileUpload: function (inputName, url, supportedTypes, callbackFunction) {
            $(inputName).fileupload({
                url: url,
                xhrFields: {
                    // For CORS request to send cookies
                    withCredentials: true
                },
                add: function (e, data) {
                    if (data.files[0].size > 10485760) {
                        alert('Max size of file: 10MB (' + data.files[0].name + ')');
                        return;
                    }

                    if (supportedTypes.length > 0 && supportedTypes[0] !== '*') {
                        if ($.inArray(data.files[0].type, supportedTypes) === -1) {
                            alert('File type is not supported. Supported types: ' + supportedTypes.join(', ') + '. [' + data.files[0].name + ']');
                            return;
                        }
                    }

                    data.submit()
                    .success(callbackFunction)
                    .error(function (jqXHR, textStatus, errorThrown) {
                        alert(textStatus + ': ' + jqXHR.responseText + ' (' + errorThrown + ')');
                    });
                    ////.complete(function (result, textStatus, jqXHR) { alert('complete'); });
                    ////
                }
            });

            // Enable iframe cross-domain access via redirect option:
            ////$('#'+inputName).fileupload(
            ////    'option',
            ////    'redirect',
            ////    window.location.href.replace(
            ////        /\/[^\/]*$/,
            ////        '/cors/result.html?%s'
            ////    )
            ////);
        }
    };
});