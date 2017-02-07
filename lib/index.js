'use strict';

const Config = require('./config');
const Session = require('./session');
const Itera = require('itera');

const internals = {};

const Functions = require('./generator-functions');


const Connect = function * (callback) {

    const session = yield Functions.generateSession(Session);

    const session2 = yield Functions.expired(session);

    const session3 = yield Functions.expireSoon(session2);

    const errorResult = yield Functions.error(session3);

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
