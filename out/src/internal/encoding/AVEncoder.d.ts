import { IAVEncoder } from './IAVEncoder';
export declare class AVEncoder implements IAVEncoder {
    constructor();
    encode(dictionary: {
        [key: string]: any;
    }): {
        [key: string]: any;
    };
    encodeItem(item: any): any;
    private isValidType(value);
}
