import { RxParseClient, RxParseObject, RxParseACL, StorageObject } from 'RxParse';
import { IAVEncoder } from './IAVEncoder';
import { AVAddOperation, AVAddUniqueOperation } from '../operation/AVAddOperation';
import { AVDeleteOperation } from '../operation/AVDeleteOperation';
import { AVRemoveOperation } from '../operation/AVRemoveOperation';

export /**
 *  AVEncoder
 */
    class AVEncoder implements IAVEncoder {

    constructor() {
    }

    encode(value: any): any {
        if (value instanceof Map) {
            let encodedDictionary = new Map<string, object>();
            value.forEach((v, k, m) => {
                let encodedV = this.encode(v);
                encodedDictionary.set(k, encodedV);
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