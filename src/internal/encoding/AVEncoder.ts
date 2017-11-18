import { RxAVClient, RxAVObject, RxAVACL, RxAVStorageObject } from '../../RxLeanCloud';
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

    encode(dictionary: { [key: string]: any }) {
        let encodedDictionary: { [key: string]: any } = {};
        for (let key in dictionary) {
            let v = dictionary[key];
            encodedDictionary[key] = this.encodeItem(v);
        }
        return encodedDictionary;
    }

    encodeList(list: Array<any>): Array<any> {
        return list.map(item => {
            return this.encodeItem(item);
        });
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
        if (item instanceof RxAVStorageObject) {
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
        if (item instanceof AVDeleteOperation) {
            return item.encode();
        }
        if (item instanceof AVAddOperation) {
            return item.encode();
        }
        if (item instanceof AVAddUniqueOperation) {
            return item.encode();
        }
        if (item instanceof AVRemoveOperation) {
            return item.encode();
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