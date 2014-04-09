'use strict';

var mime = require('mime');

module.exports = function staticGzipRegExp(urlRegexp) {

    return function compress(request, response, next) {

        //Check if we need to do something
        var acceptEncoding = request.headers['accept-encoding'] || '';
        if (!urlRegexp.test(request.url)//Request url matches given regexp?
            || !~acceptEncoding.indexOf('gzip')//Accept gzip encoding?
            || (request.method !== 'GET' && request.method !== 'HEAD'))//GET/HEAD request?
        {
            return next();
        }

        //Get the original mime type
        var contentType = mime.lookup(request.url);

        //Set the content type according to the original file
        response.setHeader('Content-Type', contentType);

        //Change url
        request.url = request.url + ".gz";

        //Vary
        var vary = response.getHeader('Vary');
        if (!vary) {
            response.setHeader('Vary', 'Accept-Encoding');
        } else if (!~vary.indexOf('Accept-Encoding')) {
            response.setHeader('Vary', vary + ', Accept-Encoding');
        }

        //Content encoding
        response.setHeader('Content-Encoding', 'gzip');
        return next();
    };
};

