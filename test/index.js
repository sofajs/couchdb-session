'use strict';

// Load modules

const Code = require('code');
const Lab = require('lab');
const CouchdbSession = require('../lib');
const Hoek = require('hoek');
const Session = require('../lib/session');
// const Path = require('path');

// Declare internals

const internals = {};


// Test shortcuts

const lab = exports.lab = Lab.script();
const describe = lab.experiment;
const before = lab.before;
const expect = Code.expect;
const it = lab.test;


describe('/index', () => {

    it(' - generate new session', (done) => {

        const Config = {
            host: 'http://localhost',
            port: 5984,
            username: 'sociallocal',
            password: 'b14sT-0ffi'
        };

        Session.cookie = null;
        Session.cookieVerbose = null;
        Session.expires = null;
        Session.expiresString = null;
        Session.status = undefined;

        CouchdbSession(Config)
            .then((result) => {

                console.log('hi');
                expect(result.status).to.equal(200);
                return done();
            })
            .catch((err) => {

                //console.log('hi' + err);
                Hoek.assert(!err, err);
                // return done();
            });
    });

    it(' - generate new session fail', (done) => {

        const Config = {
            host: 'http://localhost',
            port: 5987,
            username: 'sociallocal',
            password: 'b14sT-0ffi'
        };

        Session.cookie = null;
        Session.cookieVerbose = null;
        Session.expires = null;
        Session.expiresString = null;
        Session.status = undefined;

        CouchdbSession(Config)
            .then((result) => {

                return done();
            })
            .catch((err) => {

                // console.log('hi' + JSON.stringify(err, 2, '\t'));
                expect(err.status.name).to.equal('Error');
                return done();
            });
    });
});


describe('/session already exists', () => {

    before((done) => {

        // generate valid session

        const Config = {
            host: 'http://localhost',
            port: 5984,
            username: 'sociallocal',
            password: 'b14sT-0ffi'
        };

        Session.cookie = null;
        Session.cookieVerbose = null;
        Session.expires = null;
        Session.expiresString = null;
        Session.status = undefined;

        CouchdbSession(Config)
            .then((result) => {

                expect(result.status).to.equal(200);
                return done();
            });
    });

    it(' - generate session when one already exists.', (done) => {

        const Config = {
            host: 'http://localhost',
            port: 5984,
            username: 'sociallocal',
            password: 'b14sT-0ffi'
        };

        CouchdbSession(Config)
            .then((result) => {

                expect(result.status).to.equal(200);
                return done();
            });
    });
});


describe('/session expired regenerate', () => {

    before((done) => {

        // generate valid session

        const Config = {
            host: 'http://localhost',
            port: 5984,
            username: 'sociallocal',
            password: 'b14sT-0ffi'
        };

        Session.cookie = null;
        Session.cookieVerbose = null;
        Session.expires = null;
        Session.expiresString = null;
        Session.status = undefined;

        CouchdbSession(Config)
            .then((result) => {

                expect(result.status).to.equal(200);
                return done();
            });
    });

    it(' - create new session after expiration.', (done) => {

        const original = Session.expires;
        Session.expires = Session.expires - (11 * 60 * 1000);

        console.log('TEST MOCK:          ' + Session.expires);

        const Config = {
            host: 'http://localhost',
            port: 5984,
            username: 'sociallocal',
            password: 'b14sT-0ffi'
        };

        CouchdbSession(Config)
            .then((result) => {

                Session.expires = original;
                // expect(result.status).to.equal(200);
                console.log('new session after expiration.' + JSON.stringify(result));
                return done();
            });
    });

});

describe('/session expired fail regenerate', () => {

    before((done) => {

        // generate valid session

        const Config = {
            host: 'http://localhost',
            port: 5984,
            username: 'sociallocal',
            password: 'b14sT-0ffi'
        };

        Session.cookie = null;
        Session.cookieVerbose = null;
        Session.expires = null;
        Session.expiresString = null;
        Session.status = undefined;

        CouchdbSession(Config)
            .then((result) => {

                expect(result.status).to.equal(200);
                return done();
            });
    });

    it(' - fail create new session after expiration.', (done) => {

        const original = Session.expires;
        Session.expires = Session.expires - (11 * 60 * 1000);

        const Config = {
            host: 'http://localhost',
            port: 5987,
            username: 'sociallocal',
            password: 'b14sT-0ffi'
        };

        CouchdbSession(Config)
            .catch((err) => {

                Session.expires = original;
                expect(err.status.name).to.equal('Error');
                return done();
            });
    });
});

describe('/session expiresSoon()', () => {

    before((done) => {

        // generate valid session

        const Config = {
            host: 'http://localhost',
            port: 5984,
            username: 'sociallocal',
            password: 'b14sT-0ffi'
        };

        Session.cookie = null;
        Session.cookieVerbose = null;
        Session.expires = null;
        Session.expiresString = null;
        Session.status = undefined;

        CouchdbSession(Config)
            .then((result) => {

                expect(result.status).to.equal(200);
                return done();
            });
    });

    it(' - create new session when expires soon.', (done) => {

        const original = Session.expires;
        Session.expires = Session.expires - (10 * 60 * 1000) + 900;

        const Config = {
            host: 'http://localhost',
            port: 5984,
            username: 'sociallocal',
            password: 'b14sT-0ffi'
        };

        CouchdbSession(Config)
            .then((result) => {

                console.log('EXPIRES_SOON: ' + JSON.stringify(result));
                Session.expires = original;
                expect(result.status).to.equal(200);
                return done();
            });
    });
});

describe('/session expiresSoon() fail', () => {

    before((done) => {

        // generate valid session

        const Config = {
            host: 'http://localhost',
            port: 5984,
            username: 'sociallocal',
            password: 'b14sT-0ffi'
        };

        Session.cookie = null;
        Session.cookieVerbose = null;
        Session.expires = null;
        Session.expiresString = null;
        Session.status = undefined;

        CouchdbSession(Config)
            .then((result) => {

                expect(result.status).to.equal(200);
                return done();
            });
    });

    it(' - create new session when expires soon.', (done) => {

        const original = Session.expires;
        Session.expires = Session.expires - (10 * 60 * 1000) + 900;

        const Config = {
            host: 'http://localhost',
            port: 5987,
            username: 'sociallocal',
            password: 'b14sT-0ffi'
        };

        CouchdbSession(Config)
            .catch((error) => {

                console.log('EXPIRES_SOON_ERROR: ' + JSON.stringify(error));
                Session.expires = original;
                expect(error.status.name).to.equal('Error');
                return done();
            });
    });
});
