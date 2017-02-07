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

                console.log('first newSession.cookie: ' + newSession.cookie);
                // console.log('first session.expires: ' + newSession.expires);
                // console.log('first session.status: ' + newSession.status);
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


        // console.log('PEAK' + JSON.stringify(session.status));
        // console.log('PEAK' + JSON.stringify(session.status.name));

        if ((session.status.name !== undefined)
            && (session.status.name === 'Error')) {

            console.log('!!!expired() ERROR.' + JSON.stringify(session.status));
            console.log('!!!expired() ERROR.' + JSON.stringify(session.status.name));
            return resolve(session);
        }

        // console.log('expired() session.expires' + JSON.stringify(session.expires));
        const expiredState = session.expired();
        // console.log('expiredState ' + JSON.stringify(expiredState));

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

        console.log('');
        console.log('EXPIRE SOON STARTING');
        if ((session.status.name !== undefined)
            && (session.status.name === 'Error')) {

            console.log('expireSoon ERROR moving on');
            return resolve(session);
        }

        // session.expires = Date.now() + 100;

        const expiresSoon = Session.expiresSoon();
        console.log('expireSoon === ' + expiresSoon);

        if (!expiresSoon) {

            console.log('COVERED !expiresSoon');
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

        }, 1000);
    });
};

exports.error = (session) => {

    return new Promise((resolve, reject) => {

        // console.log('PROCESS ERROR: ' + JSON.stringify(session, 2, '\t'));

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

                console.log('BOOM');
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
