'use strict';

const Config = require('./config');
const Session = require('./session');
const Itera = require('itera');
const Rp = require('request-promise'); 

const internals = {};

const generateSession = function (session) {

    return new Promise((resolve, reject) => {

        if (session.cookie !== null) {

            return resolve();
        }

        return internals.newSession(session) 
            .then(function (newSession) {

                // console.log('first session.cookie: ' + newSession.cookie);
                // console.log('first session.expires: ' + newSession.expires);
                // console.log('first session.status: ' + newSession.status);
                return resolve(newSession);
            })
            .catch(function (newSession) {
            
                newSession.status = new Error('failed to create new session.'); 
                return reject(newSession);
            });
    });
};

const expired = function (session) {

    return new Promise((resolve, reject) => {

        const expired = session.expired();

        if (!expired) {
            return resolve(session); 
        }

        // make new session

        return internals.newSession(session) 
            .then(function (result) {

                return resolve(result);
            })
            .catch(function (result) {
            
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

        setTimeout(function () {

            return internals.newSession(session) 
                .then(function (result) {

                   return resolve(session);
                })
                .catch(function (result) {
                
                    return reject(new Error('Expired soon. Failed to re-create new session.'));
                });

        }, 1000);
    });
};

const error = function (session) {

    return new Promise((resolve, reject) => {

        if ((session.status !== undefined) 
            && (session.status.name !== undefined) 
            && (session.status.name === 'Error')) {

            return reject(session);
        }

        return resolve(session);
    });
};

internals.newSession = function (session) {

    return new Promise ((resolve, reject) => {
    
        // make session

        var options = {
            method: 'POST',
            uri: Config.connection.host + ':' + Config.connection.port + '/_session',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: 'name='+ Config.connection.username + '&password=' + Config.connection.password,
            resolveWithFullResponse: true,
            json: true // Automatically parses the JSON string in the response 
        };

        return Rp(options)
            .then(function (result) {
            
                const sessionData = internals.parseSessionHeaders(result.headers['set-cookie']);
                session.cookie = sessionData.cookie;
                session.expires = Date.parse(sessionData.expires);
                session.expiresString = sessionData.expires;
                session.status = 200;
                return resolve(session);
            })
            .catch(function (error) {

                return reject(error);
            });
    }); 
};

internals.parseSessionHeaders = function (headers) {

    const reAuthSession = /(AuthSession=)([,|:|\s|\w|-]+);/i;
    const reExpiration = /(Expires=)([,|:|\s|\w|-]+)(;)/i;
    var cookie = headers[0].match(reAuthSession);
    var expires = headers[0].match(reExpiration);

    return { cookie: cookie[1] + cookie[2], expires: expires[0] };
};

const Connect = function * (callback) {

    const session = yield generateSession(Session);

    // console.log('result1 ' + JSON.stringify(session, 2));

    // const result2 = yield regenerate(result1);
    const result2 = yield expired(session);

    // console.log('result2 ' + result2);

    const result3 = yield expireSoon(result2);

    // console.log('result3 ' + result3);

    const errorResult = yield error(result3);

    // console.log('errorResult ' + JSON.stringify(errorResult, 2));

    return callback(null, errorResult);
};


module.exports = function (configs) {

    Config.connection.host = configs.host; 
    Config.connection.port = configs.port; 
    Config.connection.username = configs.username; 
    Config.connection.password = configs.password; 

    return new Promise ((resolve, reject) => {

        Itera(Connect, function (err, session) {

            if ((session.status.name !== undefined) && (session.status.name === 'Error')) {

                return reject(session); 
            }

            return resolve(session);
        });
    });
};
