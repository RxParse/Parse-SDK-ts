"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const crypto_1 = require("crypto");
class ToolController {
    // Returns a new random hex string of the given even size.
    randomHexString(size) {
        if (size === 0) {
            throw new Error('Zero-length randomHexString is useless.');
        }
        if (size % 2 !== 0) {
            throw new Error('randomHexString size must be divisible by 2.');
        }
        return crypto_1.randomBytes(size / 2).toString('hex');
    }
    randomHexStringWithPrefix(prefix, size) {
        return prefix + this.randomHexString(size);
    }
    // Returns a new random alphanumeric string of the given size.
    //
    // Note: to simplify implementation, the result has slight modulo bias,
    // because chars length of 62 doesn't divide the number of all bytes
    // (256) evenly. Such bias is acceptable for most cases when the output
    // length is long enough and doesn't need to be uniform.
    randomString(size) {
        if (size === 0) {
            throw new Error('Zero-length randomString is useless.');
        }
        let chars = ('ABCDEFGHIJKLMNOPQRSTUVWXYZ' +
            'abcdefghijklmnopqrstuvwxyz' +
            '0123456789');
        let objectId = '';
        let bytes = crypto_1.randomBytes(size);
        for (let i = 0; i < bytes.length; ++i) {
            objectId += chars[bytes.readUInt8(i) % chars.length];
        }
        return objectId;
    }
    // Returns a new random alphanumeric string suitable for object ID.
    newObjectId() {
        //TODO: increase length to better protect against collisions.
        return this.randomString(10);
    }
    getTimestamp(unit) {
        let unitLower = unit.toLowerCase();
        if (unitLower == 'seconds' || unitLower == 'second' || unitLower == 's') {
            return Math.floor(Date.now());
        }
        else if (unitLower == 'milliseconds' || unitLower == 'millisecond' || unitLower == 'ms') {
            return new Date().getTime();
            //return Math.floor(Date.now() / 1000);
        }
    }
    // Returns a new random hex string suitable for secure tokens.
    newToken() {
        return this.randomHexString(32);
    }
    md5Hash(string) {
        return crypto_1.createHash('md5').update(string).digest('hex');
    }
    newMobilePhoneNumber() {
        let prefix = ['138', '139', '188', '186', '189', '171', '170'];
        let chars = ('0123456789');
        let mobile = prefix[Math.floor(Math.random() * prefix.length)];
        let bytes = crypto_1.randomBytes(8);
        for (let i = 0; i < bytes.length; ++i) {
            mobile += chars[bytes.readUInt8(i) % chars.length];
        }
        return mobile;
    }
}
exports.ToolController = ToolController;
