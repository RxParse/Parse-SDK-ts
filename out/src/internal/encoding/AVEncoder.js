"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const RxLeanCloud_1 = require("../../RxLeanCloud");
class AVEncoder {
    constructor() {
    }
    encode(dictionary) {
        let encodedDictionary = {};
        for (let key in dictionary) {
            let v = dictionary[key];
            encodedDictionary[key] = this.encodeItem(v);
        }
        return encodedDictionary;
    }
    encodeItem(item) {
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
            return item.map((v, i, a) => {
                return this.encodeItem(v);
            });
        }
        if (item instanceof RxLeanCloud_1.RxAVACL) {
            return item.toJSON();
        }
        return item;
    }
    isValidType(value) {
        return value == null ||
            value instanceof String ||
            value instanceof RxLeanCloud_1.RxAVObject ||
            value instanceof RxLeanCloud_1.RxAVACL ||
            value instanceof Date;
    }
}
exports.AVEncoder = AVEncoder;
