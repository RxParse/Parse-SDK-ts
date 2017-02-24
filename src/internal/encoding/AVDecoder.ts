import { IAVDecoder } from './IAVDecoder';
import { RxAVObject, RxAVACL } from '../../RxLeanCloud';

export class AVDecoder implements IAVDecoder {

    decode(data: { [key: string]: any }): { [key: string]: any } {
        let mutableData = data;
        let result: { [key: string]: any } = {};
        for (let key in mutableData) {
            result[key] = this.extractFromDictionary(mutableData, key, (v) => {
                if (Object.prototype.hasOwnProperty.call(v, '__type') || Object.prototype.hasOwnProperty.call(v, 'className')) {
                    return this.decodeItem(v);
                } else {
                    return v;
                }
            });
        }
        return result;
    }

    decodeItem(data: any): any {
        if (data == null) {
            return null;
        }

        let dict = data as { [key: string]: any };

        if (!Object.prototype.hasOwnProperty.call(dict, '__type')) {
            let newDict: { [key: string]: any } = {};
            for (let key in dict) {
                let value = dict[key];
                newDict[key] = this.decodeItem(value);
            }
            return newDict;
        } else {
            let typeString = dict['__type'];
            if (typeString == 'Date') {
                let dt: Date = new Date(dict["iso"]);
                return dt;
            } else if (typeString == 'Pointer') {
                return this.decodePointer(dict['className'], dict['objectId']);
            }
        }
        return data;
    }
    protected decodePointer(className: string, objectId: string) {
        return RxAVObject.createWithoutData(className, objectId);
    }

    protected extractFromDictionary(data: { [key: string]: any }, key: string, convertor: (value: any) => any) {
        if (Object.prototype.hasOwnProperty.call(data, key)) {
            let v = data[key];
            let result = convertor(v);
            return v;
        }
        return null;
    }
    private isValidType(value: any): boolean {
        return value == null ||
            value instanceof String ||
            value instanceof RxAVObject ||
            value instanceof RxAVACL ||
            value instanceof Date;
    }
}