import { RxParseObject, RxParseACL } from '../../RxParse';
import { IParseEncoder } from './IParseEncoder';

/**
 *
 *
 * @export
 * @class ParseEncoder
 * @implements {IParseEncoder}
 */
export class ParseEncoder implements IParseEncoder {

    constructor() {
    }

    encode(value: any): any {
        if (value instanceof Map) {
            let encodedDictionary = {};
            value.forEach((v, k, m) => {
                let encodedV = this.encode(v);
                encodedDictionary[k] = encodedV;
            });
            return encodedDictionary;
        } else if (Array.isArray(value)) {
            return this.encodeList(value);
        } else if (value instanceof Date) {
            return { '__type': 'Date', 'iso': value.toJSON() };
        } else if (value instanceof RxParseObject) {
            return {
                __type: "Pointer",
                className: value.className,
                objectId: value.objectId
            };
        } else if (typeof value.encode === 'function') {
            return value.encode();
        }

        return value;
    }

    encodeList(list: Array<any>): Array<any> {
        return list.map(item => {
            return this.encode(item);
        });
    }

    isValidType(value: any): boolean {
        return value != null ||
            value != undefined ||
            value instanceof String ||
            value instanceof RxParseObject ||
            value instanceof RxParseACL ||
            value instanceof Date ||
            value instanceof Map ||
            Array.isArray(value);
    }
}