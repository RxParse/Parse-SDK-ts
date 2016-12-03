"use strict";
var crypto_1 = require('crypto');
// Returns a new random hex string of the given even size.
function randomHexString(size) {
    if (size === 0) {
        throw new Error('Zero-length randomHexString is useless.');
    }
    if (size % 2 !== 0) {
        throw new Error('randomHexString size must be divisible by 2.');
    }
    return crypto_1.randomBytes(size / 2).toString('hex');
}
exports.randomHexString = randomHexString;
// Returns a new random alphanumeric string of the given size.
//
// Note: to simplify implementation, the result has slight modulo bias,
// because chars length of 62 doesn't divide the number of all bytes
// (256) evenly. Such bias is acceptable for most cases when the output
// length is long enough and doesn't need to be uniform.
function randomString(size) {
    if (size === 0) {
        throw new Error('Zero-length randomString is useless.');
    }
    var chars = ('ABCDEFGHIJKLMNOPQRSTUVWXYZ' +
        'abcdefghijklmnopqrstuvwxyz' +
        '0123456789');
    var objectId = '';
    var bytes = crypto_1.randomBytes(size);
    for (var i = 0; i < bytes.length; ++i) {
        objectId += chars[bytes.readUInt8(i) % chars.length];
    }
    return objectId;
}
exports.randomString = randomString;
// Returns a new random alphanumeric string suitable for object ID.
function newObjectId() {
    //TODO: increase length to better protect against collisions.
    return randomString(10);
}
exports.newObjectId = newObjectId;
// Returns a new random hex string suitable for secure tokens.
function newToken() {
    return randomHexString(32);
}
exports.newToken = newToken;
function md5Hash(string) {
    return crypto_1.createHash('md5').update(string).digest('hex');
}
exports.md5Hash = md5Hash;
function newMobilePhoneNumber() {
    var prefix = ['138', '139', '188', '186', '189', '171', '170'];
    var chars = ('0123456789');
    var mobile = prefix[Math.floor(Math.random() * prefix.length)];
    var bytes = crypto_1.randomBytes(8);
    for (var i = 0; i < bytes.length; ++i) {
        mobile += chars[bytes.readUInt8(i) % chars.length];
    }
    return mobile;
}
exports.newMobilePhoneNumber = newMobilePhoneNumber;
