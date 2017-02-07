'use strict';

const Config = require('./config');
const Session = require('./session');
const Rp = require('request-promise');

const internals = {};

exports.generateSession = function (session) {

    return new Promise((resolve, reject) => {

        if (session.cookie !== null) {

            // session alread exists

            return resolve(session);
        }

        return internals.newSession(session)
            .then((newSession) => {

                return resolve(newSession);
            })
            .catch((err) => {

                const error = {
                    status: new Error('http request failed.'),
                    raw: err
                };

                return resolve(error);
            });
    });
};

exports.expired = (session) => {

    return new Promise((resolve, reject) => {

        if ((session.status.name !== undefined)
            && (session.status.name === 'Error')) {

            return resolve(session);
        }

        const expiredState = session.expired();

        if (!expiredState) {
            return resolve(session);
        }

        // make new session

        return internals.newSession(session)
            .then((result) => {

                return resolve(result);
            })
            .catch((err) => {

                const error = {
                    status: new Error('expired() http request failed.'),
                    raw: err
                };
                return resolve(error);
            });

    });
};

exports.expireSoon = function (session) {

    return new Promise((resolve, reject) => {

        if ((session.status.name !== undefined)
            && (session.status.name === 'Error')) {

            return resolve(session);
        }

        // session.expires = Date.now() + 100;

        const expiresSoon = Session.expiresSoon();

        if (!expiresSoon) {

            return resolve(session);
        }

        setTimeout(() => {

            return internals.newSession(session)
                .then((result) => {

                    return resolve(session);
                })
                .catch((err) => {

                    const error = {
                        status: new Error('expireSoon() http request failed.'),
                        raw: err
                    };

                    return resolve(error);
                });

        }, Session.delay);
    });
};

exports.error = (session) => {

    return new Promise((resolve, reject) => {

        if ((session.status.name !== undefined)
            && (session.status.name === 'Error')) {

            return reject(session);
        }

        return resolve(session);
    });
};

internals.newSession = (session) => {

    return new Promise((resolve,reject) => {

        // make session

        const options = {
            method: 'POST',
            uri: Config.connection.host + ':' + Config.connection.port + '/_session',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: 'name=' + Config.connection.username + '&password=' + Config.connection.password,
            resolveWithFullResponse: true,
            json: true // Automatically parses the JSON string in the response
        };

        return Rp(options)
            .then((result) => {

                const sessionData = internals.parseSessionHeaders(result.headers['set-cookie']);
                session.cookie = sessionData.cookie;
                session.expires = Date.parse(sessionData.expires);
                session.expiresString = sessionData.expires;
                session.status = 200;
                return resolve(session);
            })
            .catch((err) => {

                return reject(err);
            });
    });
};

internals.parseSessionHeaders = (headers) => {

    const reAuthSession = /(AuthSession=)([,|:|\s|\w|-]+);/i;
    const reExpiration = /(Expires=)([,|:|\s|\w|-]+)(;)/i;
    const cookie = headers[0].match(reAuthSession);
    const expires = headers[0].match(reExpiration);

    return { cookie: cookie[1] + cookie[2], expires: expires[0] };
};
