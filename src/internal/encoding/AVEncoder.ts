import { RxAVClient } from '../../public/RxAVClient';

export /**
 *  AVEncoder
 */
    class AVEncoder {
    constructor() {

    }

    static encode(dictionary: { [key: string]: any }) {
        let encodedDictionary: { [key: string]: any } = {};
        for (let key in dictionary) {
            let v = dictionary[key];
            encodedDictionary[key] = AVEncoder.encodeItem(v);
            RxAVClient.printLog(key, v, '->', encodedDictionary[key]);

        }
        return encodedDictionary;
    }

    static encodeItem(item: any): any {
        if (item instanceof Date) {
            return { '__type': 'Date', 'iso': item.toJSON() };
        }
        if (item instanceof Array) {
            return item.map((v, i, a) => {
                return AVEncoder.encodeItem(v);
            });
        }
        return item;
    }
}