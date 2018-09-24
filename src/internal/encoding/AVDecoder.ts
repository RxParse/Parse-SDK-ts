import { IAVDecoder } from './IAVDecoder';
import { RxParseObject, RxParseACL, RxParseUser } from 'RxParse';

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

        if (this.isBuiltInType(data))
            return data;

        if (Array.isArray(data)) {
            
            return data.map(item => {
                return this.decodeItem(item);
            });
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
        if (className == '_User') {
            return RxParseUser.createWithoutData(objectId);
        }
        return RxParseObject.createWithoutData(className, objectId);
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
            value instanceof RxParseObject ||
            value instanceof RxParseACL ||
            value instanceof Date;
    }

    private isBuiltInType(value: any): boolean {
        return typeof value == 'number' ||
            typeof value == 'string' ||
            typeof value == 'boolean';
    }
}