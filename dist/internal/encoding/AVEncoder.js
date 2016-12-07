"use strict";
var RxLeanCloud_1 = require('../../RxLeanCloud');
var AVEncoder = (function () {
    function AVEncoder() {
    }
    AVEncoder.prototype.encode = function (dictionary) {
        var encodedDictionary = {};
        for (var key in dictionary) {
            var v = dictionary[key];
            encodedDictionary[key] = this.encodeItem(v);
        }
        return encodedDictionary;
    };
    AVEncoder.prototype.encodeItem = function (item) {
        var _this = this;
        if (item instanceof Date) {
            return { '__type': 'Date', 'iso': item.toJSON() };
        }
        if (item instanceof RxLeanCloud_1.RxAVObject) {
            return {
                __type: "Pointer",
                className: item.className,
                objectId: item.objectId
            };
        }
        if (item instanceof Array) {
            return item.map(function (v, i, a) {
                return _this.encodeItem(v);
            });
        }
        return item;
    };
    return AVEncoder;
}());
exports.AVEncoder = AVEncoder;
