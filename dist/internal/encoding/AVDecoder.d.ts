import { IAVDecoder } from './IAVDecoder';
import { RxAVObject } from '../../RxLeanCloud';
export declare class AVDecoder implements IAVDecoder {
    decode(data: {
        [key: string]: any;
    }): {
        [key: string]: any;
    };
    decodeItem(data: any): any;
    protected decodePointer(className: string, objectId: string): RxAVObject;
    protected extractFromDictionary(data: {
        [key: string]: any;
    }, key: string, convertor: (value: any) => any): any;
    private isValidType(value);
}
