import { RxAVClient, RxAVObject, RxAVACL } from '../../RxLeanCloud';
import { IAVEncoder } from './IAVEncoder';

export /**
 *  AVEncoder
 */
    class AVEncoder implements IAVEncoder {
    constructor() {

    }

    encode(dictionary: { [key: string]: any }) {
        let encodedDictionary: { [key: string]: any } = {};
        for (let key in dictionary) {
            let v = dictionary[key];
            encodedDictionary[key] = this.encodeItem(v);
        }
        return encodedDictionary;
    }
    encodeItem(item: any): any {
        if (item instanceof Date) {
            return { '__type': 'Date', 'iso': item.toJSON() };
        }
        if (item instanceof RxAVObject) {
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
        if (item instanceof RxAVACL) {
            return item.toJSON();
        }

        return item;
    }
    private isValidType(value: any): boolean {
        return value == null ||
            value instanceof String ||
            value instanceof RxAVObject ||
            value instanceof RxAVACL ||
            value instanceof Date;
    }
}