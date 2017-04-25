"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const RxLeanCloud_1 = require("../../RxLeanCloud");
class AVDecoder {
    decode(data) {
        let mutableData = data;
        let result = {};
        for (let key in mutableData) {
            result[key] = this.extractFromDictionary(mutableData, key, (v) => {
                if (Object.prototype.hasOwnProperty.call(v, '__type') || Object.prototype.hasOwnProperty.call(v, 'className')) {
                    return this.decodeItem(v);
                }
                else {
                    return v;
                }
            });
        }
        return result;
    }
    decodeItem(data) {
        if (data == null) {
            return null;
        }
        let dict = data;
        if (!Object.prototype.hasOwnProperty.call(dict, '__type')) {
            let newDict = {};
            for (let key in dict) {
                let value = dict[key];
                newDict[key] = this.decodeItem(value);
            }
            return newDict;
        }
        else {
            let typeString = dict['__type'];
            if (typeString == 'Date') {
                let dt = new Date(dict["iso"]);
                return dt;
            }
            else if (typeString == 'Pointer') {
                return this.decodePointer(dict['className'], dict['objectId']);
            }
        }
        return data;
    }
    decodePointer(className, objectId) {
        return RxLeanCloud_1.RxAVObject.createWithoutData(className, objectId);
    }
    extractFromDictionary(data, key, convertor) {
        if (Object.prototype.hasOwnProperty.call(data, key)) {
            let v = data[key];
            let result = convertor(v);
            return v;
        }
        return null;
    }
    isValidType(value) {
        return value == null ||
            value instanceof String ||
            value instanceof RxLeanCloud_1.RxAVObject ||
            value instanceof RxLeanCloud_1.RxAVACL ||
            value instanceof Date;
    }
}
exports.AVDecoder = AVDecoder;
