'use strict';

const Config = require('./config');
const Session = require('./session');
const Itera = require('itera');
const Rp = require('request-promise'); 

const internals = {};

const generate = function () {

    return new Promise((resolve, reject) => {

        if (Session.cookie !== null) {

            return resolve();
        }

        return internals.newSession() 
            .then(function (result) {

                console.log('first session: ' + Session.cookie);
                console.log('first session: ' + Session.expires);
                return resolve('SUCCESS: generate');
            })
            .catch(function (result) {
            
                return reject(new Error('Failed to create session.'));
            });
    });
};

const regenerate = function () {

    return new Promise((resolve, reject) => {

        const expired = Session.expired();
        console.log('expired: ' + expired);

        if (!expired) {
            return resolve(); 
        }


        // make new session

        return internals.newSession() 
            .then(function (result) {

                return resolve('SUCCESS: regenerate');
            })
            .catch(function (result) {
            
                return reject(new Error('Failed to create session.'));
            });

    });
};

const protect = function () {

    return new Promise((resolve, reject) => {

        Session.expires = Date.now() + 100;
        const expiresSoon = Session.expiresSoon();

        if (!expiresSoon) {

            return resolve(); 
        }

        // delay then create new session.

        setTimeout(function () {

            console.log('setTimeout protect ' + Session.cookie);
            console.log('setTimeout protect ' + Session.expires);
            console.log('setTimeout protect ' + Session.expiresString);

            return internals.newSession() 
                .then(function (result) {

                    console.log('protectedSession.cookie        ' + Session.cookie);
                    console.log('protectedSession.expires       ' + Session.expires);
                    console.log('protectedSession.expiresString ' + Session.expiresString);
                    return resolve('SUCCESS: protect');
                })
                .catch(function (result) {
                
                    return reject(new Error('Failed to create session.'));
                });

        }, 1000);
    });
};

internals.newSession = function () {

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
                Session.cookie = sessionData.cookie;
                Session.expires = Date.parse(sessionData.expires);
                Session.expiresString = sessionData.expires;
                return resolve(sessionData);
            })
            .catch(function (error) {

                return reject(new Error('Failed to create couchdb session.'));
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

    const result1 = yield generate();

    console.log('result1 ' + result1);

    const result2 = yield regenerate();

    console.log('result2 ' + result2);

    const result3 = yield protect();

    console.log('result3 ' + result3);

    return callback(null, 'generator done' + result3);
};


module.exports = function (configs) {

    return new Promise ((resolve, reject) => {

        Itera(Connect, function (err, result) {

            if (err) {
                return reject('ITERA ERROR: ' + err + ' ' + result); 
            }

            return resolve('ITERA SUCCESS: resolved it.' + result);
        });
    });
};
