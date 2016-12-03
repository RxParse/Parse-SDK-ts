import { ILeanEngineDecoder } from './ILeanEngineDecoder';
import { IAVDecoder } from '../../encoding/IAVDecoder';
import { IAVObjectDecoder } from '../../encoding/IAVObjectDecoder';
import { IObjectState } from '../../object/state/IObjectState';
export declare class LeanEngineDecoder implements ILeanEngineDecoder {
    protected _AVDecoder: IAVDecoder;
    protected _AVObjectDecoder: IAVObjectDecoder;
    constructor(AVDecoder: IAVDecoder, AVObjectDecoder: IAVObjectDecoder);
    decodeAVObject(serverResponse: {
        [key: string]: any;
    }): IObjectState;
    decodeDictionary(serverResponse: {
        [key: string]: any;
    }): {
        [key: string]: any;
    };
}
