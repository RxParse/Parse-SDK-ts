"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var RxLeanCloud_1 = require("../../RxLeanCloud");
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
        if (item instanceof RxLeanCloud_1.RxAVACL) {
            return item.toJSON();
        }
        return item;
    };
    AVEncoder.prototype.isValidType = function (value) {
        return value == null ||
            value instanceof String ||
            value instanceof RxLeanCloud_1.RxAVObject ||
            value instanceof RxLeanCloud_1.RxAVACL ||
            value instanceof Date;
    };
    return AVEncoder;
}());
exports.AVEncoder = AVEncoder;
