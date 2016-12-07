import { RxAVClient, RxAVObject } from '../../RxLeanCloud';
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
            // RxAVClient.printLog(key, v, '->', encodedDictionary[key]);
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
        return item;
    }
}