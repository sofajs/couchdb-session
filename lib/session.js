'use strict';

exports.cookie = null;
exports.cookieFull = null;
exports.expires = null;
exports.expiresString = null;
// exports.ttl = 600;  // 600 seconds 10 minutes.
exports.nano = null;
exports.expired = function () {

    if (Date.now() > this.expires) {
        return true;
    }

    return false;
};

exports.expiresSoon = function () {

    const age = this.expires - Date.now();

    // console.log('soon check: ' + age);
    if (age < 1000) {
        return true;
    }

    return false;
};

exports.status = undefined;
exports.delay = 1000;  // delay for expireSoon()
