'use strict';

const Stream = require('stream');
const Hoek = require('hoek');

const internals = {
    defaults: {
        header: 'x-correlation-id'
    }
};

internals.fetchId = (headers, header) => {

    for (const name of Object.keys(headers)) {
        if (name.toLowerCase() === header) {
            return headers[name];
        }
    }
};

class Correlation extends Stream.Transform {
    constructor(header, options) {

        header = header || internals.defaults.header;

        Hoek.assert(typeof header === 'string', 'header must be a string');

        options = Object.assign({}, options, {
            objectMode: true
        });
        super(options);
        this._header = header.toLowerCase();
    }

    _transform(data, enc, next) {

        switch (data.event) {
            case 'request':
            case 'error':
                if (data.headers) {

                    data.correlationId = internals.fetchId(data.headers, this._header);
                }

                break;

            case 'response':
                if (data.responseHeaders) {

                    data.correlationId = internals.fetchId(data.responseHeaders, this._header);
                }

                if (!data.correlationId && data.headers) {

                    data.correlationId = internals.fetchId(data.headers, this._header);
                }

                break;
        }

        next(null, data);
    }
}

module.exports = Correlation;
