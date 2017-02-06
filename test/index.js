'use strict';

// Load modules

const Code = require('code');
const Lab = require('lab');
const CouchdbSession = require('../lib');
const Path = require('path');

// Declare internals

const internals = {};


// Test shortcuts

const lab = exports.lab = Lab.script();
const describe = lab.experiment;
const expect = Code.expect;
const it = lab.test;


describe('/index', () => {

    it('generate connection object', (done) => {

        const Config = {
            host: 'http://localhost',
            port: 5984,
            username: 'sociallocal',
            password: 'b14sT-0ffi',
        }

        CouchdbSession(Config)
            .then(function (result) {
            
                console.log('');
                console.log('**COMPLETED**');
                console.log(result);
                done();
            })
            .catch(function (error) {
            
                console.log('');
                console.log('**COMPLETED WITH ERROR**');
                console.log(error.status);
                done();
            });
    });

});
