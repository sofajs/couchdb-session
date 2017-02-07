'use strict';

const Config = require('./config');
const Session = require('./session');
const Itera = require('itera');
const Rp = require('request-promise');

const internals = {};

const generateSession = function (session) {

    return new Promise((resolve, reject) => {

        if (session.cookie !== null) {

            return resolve(session);
        }

        return internals.newSession(session)
            .then((newSession) => {

                console.log('first session.cookie: ' + newSession.cookie);
                // console.log('first session.expires: ' + newSession.expires);
                // console.log('first session.status: ' + newSession.status);
                return resolve(newSession);
            })
            .catch((err) => {

                // newSession.status = new Error('http request failed. no session created');
                // console.log('STATUS: ' + JSON.stringify(err));
                const errSession = {};
                errSession.status = new Error('http request failed. no session created');
                errSession.status.raw = err;
                return resolve(errSession);
            });
    });
};

const expired = (session) => {

    return new Promise((resolve, reject) => {

        const expiredState = session.expired();

        if (!expiredState) {
            return resolve(session);
        }

        // make new session

        return internals.newSession(session)
            .then((result) => {

                return resolve(result);
            })
            .catch((result) => {

                console.log('TARGET COVERAGE');
                return reject(new Error('Expired session. Failed to re-create new session.'));
            });

    });
};

const expireSoon = function (session) {

    return new Promise((resolve, reject) => {

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
                .catch((result) => {

                    return reject(new Error('Expired soon. Failed to re-create new session.'));
                });

        }, 1000);
    });
};

const error = (session) => {

    return new Promise((resolve, reject) => {

        if ((session.status !== undefined)
            && (session.status.name !== undefined)
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

const Connect = function * (callback) {

    const session = yield generateSession(Session);

    // if ((session.status !== undefined) && (session.status.name === 'Error')) {
    //     // http request failed.
    //     return callback(session);
    // }

    // const result2 = yield regenerate(result1);
    const result2 = yield expired(session);

    // console.log('result2 ' + result2);

    const result3 = yield expireSoon(result2);

    // console.log('result3 ' + result3);

    const errorResult = yield error(result3);

    // console.log('errorResult ' + JSON.stringify(errorResult, 2));

    return callback(errorResult);
};


module.exports = function (configs) {

    Config.connection.host = configs.host;
    Config.connection.port = configs.port;
    Config.connection.username = configs.username;
    Config.connection.password = configs.password;

    return new Promise((resolve, reject) => {

        Itera(Connect, (session) => {

            if ((session.status.name !== undefined) && (session.status.name === 'Error')) {

                return reject(session);
            }

            return resolve(session);
        });
    });
};
