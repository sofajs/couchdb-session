'use strict';

const Config = require('./config');
const Session = require('./session');
const Itera = require('itera');

const internals = {};

const Functions = require('./generator-functions');


const Connect = function * (callback) {

    const session = yield Functions.generateSession(Session);

    // if ((session.status !== undefined)
    //     && (session.status.name !== undefined)
    //     && (session.status.name === 'Error')) {

    //         console.log('ERROR PASSED TO EXPIRED: ' + JSON.stringify(session.status, 2, '\t'));
    //         console.log('ERROR PASSED TO EXPIRED: ' + JSON.stringify(session.status.name, 2, '\t'));

    //     } else {

    //         console.log('SUCCESS PASS TO EXPIRED: ' + JSON.stringify(session.status, 2, '\t'));
    //     }

    const session2 = yield Functions.expired(session);

    // // console.log('result2 ' + result2);

    // if ((session2.status !== undefined)
    //     && (session2.status.name !== undefined)
    //     && (session2.status.name === 'Error')) {

    //     console.log('ERROR PASSED TO EXPIRE_SOON: ' + JSON.stringify(session2.status, 2, '\t'));
    //     console.log('ERROR PASSED TO EXPIRE_SOON: ' + JSON.stringify(session2.status.name, 2, '\t'));

    // } else {

    //     console.log('SUCCESS PASS TO EXPIRE_SOON: ' + JSON.stringify(session2.status, 2, '\t'));
    // }

    const session3 = yield Functions.expireSoon(session2);

    // // console.log('result3 ' + result3);

    const errorResult = yield Functions.error(session3);

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
