import { IAVDecoder } from './IAVDecoder';
export declare class AVDecoder implements IAVDecoder {
    decode(data: {
        [key: string]: any;
    }): {
        [key: string]: any;
    };
    extractFromDictionary(data: {
        [key: string]: any;
    }, key: string, convertor: (value: any) => any): any;
}
