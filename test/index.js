'use strict';

// Load modules
const Stream = require('stream');
const Code = require('code');
const Lab = require('lab');


const Correlation = require('..');


// Declare internals

const internals = {};

internals.Writer = class extends Stream.Writable {
    constructor() {

        super({ objectMode: true });
        this.data = [];
    }

    _write(chunk, enc, callback) {

        this.data.push(chunk);
        callback(null);
    }
};

internals.Reader = class extends Stream.Readable {
    constructor() {

        super({ objectMode: true });
    }

    _read() {
    }
};

internals.ops = {
    event: 'ops',
    timestamp: 1458264810957,
    host: 'localhost',
    pid: 64291,
    os: {
        load: [1.650390625, 1.6162109375, 1.65234375],
        mem: { total: 17179869184, free: 8190681088 },
        uptime: 704891
    },
    proc: {
        uptime: 6,
        mem: {
            rss: 30019584,
            heapTotal: 18635008,
            heapUsed: 9989304
        },
        delay: 0.03084501624107361
    },
    load: {
        requests: {},
        concurrents: {},
        responseTimes: {},
        listener: {},
        sockets: { http: {}, https: {} }
    }
};

internals.response = {
    event: 'response',
    timestamp: 1458264810957,
    id: '1458264811279:localhost:16014:ilx17kv4:10001',
    instance: 'http://localhost:61253',
    labels: [],
    method: 'post',
    url: '/data',
    responseTime: 150,
    statusCode: 200,
    pid: 16014,
    httpVersion: '1.1',
    source: {
        remoteAddress: '127.0.0.1',
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/49.0.2623.87 Safari/537.36',
        referer: 'http://localhost:61253/'
    },
    config: {
        includes: {
            request: ['headers'],
            response: ['headers']
        }
    },
    responseHeaders: {
        'x-correlation-id': '4242342-32424-32424-324243'
    },
    headers: {
        'x-correlation-id': '777777-32424-32424-324243'
    }
};

internals.responseWithoutHeaders = {
    event: 'response',
    timestamp: 1458264810957,
    id: '1458264811279:localhost:16014:ilx17kv4:10001',
    instance: 'http://localhost:61253',
    labels: [],
    method: 'post',
    url: '/data',
    responseTime: 150,
    statusCode: 200,
    pid: 16014,
    httpVersion: '1.1',
    source: {
        remoteAddress: '127.0.0.1',
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/49.0.2623.87 Safari/537.36',
        referer: 'http://localhost:61253/'
    },
    config: {}
};

internals.responseWithoutResponseHeaders = {
    event: 'response',
    timestamp: 1458264810957,
    id: '1458264811279:localhost:16014:ilx17kv4:10001',
    instance: 'http://localhost:61253',
    labels: [],
    method: 'post',
    url: '/data',
    responseTime: 150,
    statusCode: 200,
    pid: 16014,
    httpVersion: '1.1',
    source: {
        remoteAddress: '127.0.0.1',
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/49.0.2623.87 Safari/537.36',
        referer: 'http://localhost:61253/'
    },
    config: {
        includes: {
            request: ['headers']
        }
    },
    headers: {
        'x-correlation-id': '777777-32424-32424-324243'
    }
};

internals.request = {
    event: 'request',
    timestamp: 1458264810957,
    tags: ['user', 'info'],
    data: 'you made a request',
    pid: 64291,
    id: '1419005623332:new-host.local:48767:i3vrb3z7:10000',
    method: 'get',
    url: '/',
    config: {
        includes: {
            request: ['headers']
        }
    },
    error: null,
    headers: {
        'x-correlation-id': '4242342-32424-32424-324243'
    }
};

internals.requestWithoutHeaders = {
    event: 'request',
    timestamp: 1458264810957,
    tags: ['user', 'info'],
    data: 'you made a request',
    pid: 64291,
    id: '1419005623332:new-host.local:48767:i3vrb3z7:10000',
    method: 'get',
    url: '/',
    config: {},
    error: null
};

internals.error = {
    event: 'error',
    timestamp: 1458264810957,
    id: '1419005623332:new-host.local:48767:i3vrb3z7:10000',
    tags: ['user', 'info'],
    url: 'http://localhost/test',
    method: 'get',
    pid: 64291,
    error: {
        message: 'Just a simple error',
        stack: 'Error: Just a simple Error'
    },
    config: {
        includes: {
            request: ['headers']
        }
    },
    headers: {
        'x-correlation-id': '4242342-32424-32424-324243'
    }
};

internals.errorWithoutHeaders = {
    event: 'error',
    timestamp: 1458264810957,
    id: '1419005623332:new-host.local:48767:i3vrb3z7:10000',
    tags: ['user', 'info'],
    url: 'http://localhost/test',
    method: 'get',
    pid: 64291,
    error: {
        message: 'Just a simple error',
        stack: 'Error: Just a simple Error'
    }
};

internals.default = {
    event: 'request',
    timestamp: 1458264810957,
    tags: ['user', 'info'],
    data: 'you made a default',
    pid: 64291
};

// Test shortcuts

const { describe, it } = exports.lab = Lab.script();
const expect = Code.expect;


describe('Correlation', () => {

    describe('response events', () => {

        it('returns an event with correlationId for "response" events', { plan: 4 }, () => {

            const reporter = new Correlation();
            const out = new internals.Writer();
            const reader = new internals.Reader();

            reader.pipe(reporter).pipe(out);
            reader.push(internals.response);
            reader.push(null);
            reader.once('end', () => {

                expect(out.data).to.have.length(1);
                expect(out.data[0]).to.be.an.object();
                expect(out.data[0]).to.contain('correlationId');
                expect(out.data[0].correlationId).to.equal(internals.response.responseHeaders['x-correlation-id']);
            });
        });

        it('returns an event without correlationId for "response" events without headers', { plan: 3 }, () => {

            const reporter = new Correlation();
            const out = new internals.Writer();
            const reader = new internals.Reader();

            reader.pipe(reporter).pipe(out);
            reader.push(internals.responseWithoutHeaders);
            reader.push(null);
            reader.once('end', () => {

                expect(out.data).to.have.length(1);
                expect(out.data[0]).to.be.an.object();
                expect(out.data[0]).to.not.contain('correlationId');
            });
        });

        it('returns an event without correlationId for "response" events without response headers', { plan: 4 }, () => {

            const reporter = new Correlation();
            const out = new internals.Writer();
            const reader = new internals.Reader();

            reader.pipe(reporter).pipe(out);
            reader.push(internals.responseWithoutResponseHeaders);
            reader.push(null);
            reader.once('end', () => {

                expect(out.data).to.have.length(1);
                expect(out.data[0]).to.be.an.object();
                expect(out.data[0]).to.contain('correlationId');
                expect(out.data[0].correlationId).to.equal(internals.response.headers['x-correlation-id']);
            });
        });
    });

    describe('request events', () => {

        it('returns an event with correlationId for "request" events', { plan: 4 }, () => {

            const reporter = new Correlation();
            const out = new internals.Writer();
            const reader = new internals.Reader();

            reader.pipe(reporter).pipe(out);
            reader.push(internals.request);
            reader.push(null);
            reader.once('end', () => {

                expect(out.data).to.have.length(1);
                expect(out.data[0]).to.be.an.object();
                expect(out.data[0]).to.contain('correlationId');
                expect(out.data[0].correlationId).to.equal(internals.request.headers['x-correlation-id']);
            });
        });

        it('returns an event without correlationId for "request" events without headers', { plan: 3 }, () => {

            const reporter = new Correlation();
            const out = new internals.Writer();
            const reader = new internals.Reader();

            reader.pipe(reporter).pipe(out);
            reader.push(internals.requestWithoutHeaders);
            reader.push(null);
            reader.once('end', () => {

                expect(out.data).to.have.length(1);
                expect(out.data[0]).to.be.an.object();
                expect(out.data[0]).to.not.contain('correlationId');
            });
        });
    });

    describe('error events', () => {

        it('returns an event with correlationId for "error" events', { plan: 4 }, () => {

            const reporter = new Correlation();
            const out = new internals.Writer();
            const reader = new internals.Reader();

            reader.pipe(reporter).pipe(out);
            reader.push(internals.error);
            reader.push(null);
            reader.once('end', () => {

                expect(out.data).to.have.length(1);
                expect(out.data[0]).to.be.an.object();
                expect(out.data[0]).to.contain('correlationId');
                expect(out.data[0].correlationId).to.equal(internals.error.headers['x-correlation-id']);
            });
        });

        it('returns an event without correlationId for "error" events without headers', { plan: 3 }, () => {

            const reporter = new Correlation();
            const out = new internals.Writer();
            const reader = new internals.Reader();

            reader.pipe(reporter).pipe(out);
            reader.push(internals.errorWithoutHeaders);
            reader.push(null);
            reader.once('end', () => {

                expect(out.data).to.have.length(1);
                expect(out.data[0]).to.be.an.object();
                expect(out.data[0]).to.not.contain('correlationId');
            });
        });
    });

    describe('default events', () => {

        it('returns an event without correlationId for "default" events', { plan: 3 }, () => {

            const reporter = new Correlation();
            const out = new internals.Writer();
            const reader = new internals.Reader();

            reader.pipe(reporter).pipe(out);
            reader.push(internals.default);
            reader.push(null);
            reader.once('end', () => {

                expect(out.data).to.have.length(1);
                expect(out.data[0]).to.be.an.object();
                expect(out.data[0]).to.not.contain('correlationId');
            });
        });
    });

    describe('ops events', () => {

        it('returns an event without correlationId for "ops" events', { plan: 3 }, () => {

            const reporter = new Correlation();
            const out = new internals.Writer();
            const reader = new internals.Reader();

            reader.pipe(reporter).pipe(out);
            reader.push(internals.ops);
            reader.push(null);
            reader.once('end', () => {

                expect(out.data).to.have.length(1);
                expect(out.data[0]).to.be.an.object();
                expect(out.data[0]).to.not.contain('correlationId');
            });
        });
    });

    describe('header case', () => {

        it('returns an event with correlationId for "request" events when header in non-lowercase', { plan: 4 }, () => {

            const reporter = new Correlation('X-Correlation-ID');
            const out = new internals.Writer();
            const reader = new internals.Reader();

            reader.pipe(reporter).pipe(out);
            reader.push(internals.request);
            reader.push(null);
            reader.once('end', () => {

                expect(out.data).to.have.length(1);
                expect(out.data[0]).to.be.an.object();
                expect(out.data[0]).to.contain('correlationId');
                expect(out.data[0].correlationId).to.equal(internals.request.headers['x-correlation-id']);
            });
        });

        it('returns an event with correlationId for "request" events when request headers in non-lowercase', { plan: 4 }, () => {

            const reporter = new Correlation();
            const out = new internals.Writer();
            const reader = new internals.Reader();

            const event = Object.assign({}, internals.request, {
                headers: {
                    'X-Correlation-ID': 'test123'
                }
            });

            reader.pipe(reporter).pipe(out);
            reader.push(event);
            reader.push(null);
            reader.once('end', () => {

                expect(out.data).to.have.length(1);
                expect(out.data[0]).to.be.an.object();
                expect(out.data[0]).to.contain('correlationId');
                expect(out.data[0].correlationId).to.equal('test123');
            });
        });
    });

    it('throws an error if "header" not a truthy string', { plan: 2 }, () => {

        expect(() => {

            new Correlation({});
        }).to.throw('header must be a string');
        expect(() => {

            new Correlation(1);
        }).to.throw('header must be a string');
    });

    it('allows without arguments', { plan: 0 }, () => {

        new Correlation();
    });

    it('allows null event arguments', { plan: 0 }, () => {

        new Correlation(null);
    });
});
