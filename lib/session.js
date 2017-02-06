exports.cookie = null;
exports.cookieVerbose = null;
exports.expires = null;  
exports.expiresString = null;  
// exports.ttl = 600;  // 600 seconds 10 minutes.
exports.nano = null;
exports.expired = function () {

    const age = Date.now() - Date.parse(this.expires);

    if (Date.now() > Date.parse(this.expires)) {
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
