"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var RxLeanCloud_1 = require("../../RxLeanCloud");
var AVDecoder = (function () {
    function AVDecoder() {
    }
    AVDecoder.prototype.decode = function (data) {
        var _this = this;
        var mutableData = data;
        var result = {};
        for (var key in mutableData) {
            result[key] = this.extractFromDictionary(mutableData, key, function (v) {
                if (Object.prototype.hasOwnProperty.call(v, '__type') || Object.prototype.hasOwnProperty.call(v, 'className')) {
                    return _this.decodeItem(v);
                }
                else {
                    return v;
                }
            });
        }
        return result;
    };
    AVDecoder.prototype.decodeItem = function (data) {
        if (data == null) {
            return null;
        }
        var dict = data;
        if (!Object.prototype.hasOwnProperty.call(dict, '__type')) {
            var newDict = {};
            for (var key in dict) {
                var value = dict[key];
                newDict[key] = this.decodeItem(value);
            }
            return newDict;
        }
        else {
            var typeString = dict['__type'];
            if (typeString == 'Date') {
                var dt = new Date(dict["iso"]);
                return dt;
            }
            else if (typeString == 'Pointer') {
                return this.decodePointer(dict['className'], dict['objectId']);
            }
        }
        return data;
    };
    AVDecoder.prototype.decodePointer = function (className, objectId) {
        return RxLeanCloud_1.RxAVObject.createWithoutData(className, objectId);
    };
    AVDecoder.prototype.extractFromDictionary = function (data, key, convertor) {
        if (Object.prototype.hasOwnProperty.call(data, key)) {
            var v = data[key];
            var result = convertor(v);
            return v;
        }
        return null;
    };
    AVDecoder.prototype.isValidType = function (value) {
        return value == null ||
            value instanceof String ||
            value instanceof RxLeanCloud_1.RxAVObject ||
            value instanceof RxLeanCloud_1.RxAVACL ||
            value instanceof Date;
    };
    return AVDecoder;
}());
exports.AVDecoder = AVDecoder;
