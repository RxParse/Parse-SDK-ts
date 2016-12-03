import { IAVDecoder } from './IAVDecoder';

export class AVDecoder implements IAVDecoder {

    decode(data: { [key: string]: any }): { [key: string]: any } {
        let mutableData = data;
        let result: { [key: string]: any } = {};
        for (let key in mutableData) {
            result[key] = this.extractFromDictionary(mutableData, key, (v) => {
                return v;
            });
        }
        return result;
    }

    extractFromDictionary(data: { [key: string]: any }, key: string, convertor: (value: any) => any) {
        if (Object.prototype.hasOwnProperty.call(data, key)) {
            let v = data[key];
            let result = convertor(v);
            return v;
        }
        return null;
    }
}