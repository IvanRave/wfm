// https://github.com/jaubourg/ajaxHooks/blob/master/src/xdr.js
// http://www.eriwen.com/javascript/how-to-cors/
// http://api.brain-map.org/examples/doc/scatter/javascripts/jquery.ie.cors.js.html
// https://github.com/MoonScript/jQuery-ajaxTransport-XDomainRequest/blob/8754607e5f9ab73ccc37246f0c12fed14f85bd28/jQuery.XDomainRequest.js
if (window.XDomainRequest) {
    jQuery.ajaxTransport(function (s) {
        if (s.crossDomain && s.async) {
            if (s.timeout) {
                s.xdrTimeout = s.timeout;
                delete s.timeout;
            }
            var xdr;
            return {
                send: function (_, complete) {
                    function callback(status, statusText, responses, responseHeaders) {
                        xdr.onload = xdr.onerror = xdr.ontimeout = jQuery.noop;
                        xdr = undefined;
                        complete(status, statusText, responses, responseHeaders);
                    }
                    xdr = new XDomainRequest();
                    xdr.onload = function () {
                        callback(200, "OK", { text: xdr.responseText }, "Content-Type: " + xdr.contentType);
                    };
                    xdr.onerror = function () {
                        callback(404, "Not Found");
                    };
                    xdr.onprogress = jQuery.noop;
                    xdr.ontimeout = function () {
                        callback(0, "timeout");
                    };
                    xdr.timeout = s.xdrTimeout || Number.MAX_VALUE;
                    xdr.open(s.type, s.url);
                    xdr.send((s.hasContent && s.data) || null);
                },
                abort: function () {
                    if (xdr) {
                        xdr.onerror = jQuery.noop;
                        xdr.abort();
                    }
                }
            };
        }
    });
}