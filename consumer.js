'use strict';


const SessionKeeper = require('./lib/index');

const Config = {
    host: 'http://localhost',
    port: 5984,
    username: 'sociallocal',
    password: 'b14sT-0ffi'
};

SessionKeeper(Config)
    .then((result) => {

        console.log('');
        console.log('**COMPLETED**');
        console.log(result);
    })
    .catch((error) => {

        console.log('');
        console.log('**COMPLETED WITH ERROR**');
        console.log(error.status);
    });
