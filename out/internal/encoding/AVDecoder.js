"use strict";
var AVDecoder = (function () {
    function AVDecoder() {
    }
    AVDecoder.prototype.decode = function (data) {
        var mutableData = data;
        var result = {};
        for (var key in mutableData) {
            result[key] = this.extractFromDictionary(mutableData, key, function (v) {
                return v;
            });
        }
        return result;
    };
    AVDecoder.prototype.extractFromDictionary = function (data, key, convertor) {
        if (Object.prototype.hasOwnProperty.call(data, key)) {
            var v = data[key];
            var result = convertor(v);
            return v;
        }
        return null;
    };
    return AVDecoder;
}());
exports.AVDecoder = AVDecoder;
