'use strict';

// Load modules

const Code = require('code');
const Lab = require('lab');
const CouchdbSession = require('../lib');
const Hoek = require('hoek');
const Session = require('../lib/session');


// Declare internals

const internals = {};


// Test shortcuts

const lab = exports.lab = Lab.script();
const describe = lab.experiment;
const before = lab.before;
const expect = Code.expect;
const it = lab.test;

const Rp = require('request-promise');

describe('/make user', () => {

    it('generate db admin user', (done) => {

        // make new admin user

        const Config = {
            host: 'http://localhost',
            port: 5984,
            username: 'sociallocal',
            password: 'b14sT-0ffi'
        };

        const options = {
            method: 'PUT',
            uri: Config.host + ':' + Config.port + '/_admins/' + Config.username,
            body: Config.password,
            resolveWithFullResponse: true,
            json: true // Automatically parses the JSON string in the response
        };

        Rp(options)
            .then((result) => {

                expect(result).to.exist();
                return done();
            });

    });

});

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

                expect(result.status).to.equal(200);
                return done();
            })
            .catch((err) => {

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

        const Config = {
            host: 'http://localhost',
            port: 5984,
            username: 'sociallocal',
            password: 'b14sT-0ffi'
        };

        CouchdbSession(Config)
            .then((result) => {

                Session.expires = original;
                expect(result.status).to.equal(200);
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

describe('/session expiresSoon()', { timeout: 4000 }, () => {

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

                Session.expires = original;
                expect(result.status).to.equal(200);
                return done();
            });
    });
});

describe('/session expireSoon() fail', { timeout: 4000 }, () => {

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

                Session.expires = original;
                expect(error.status.name).to.equal('Error');
                return done();
            });
    });
});
