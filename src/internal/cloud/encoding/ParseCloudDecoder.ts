import { IParseCloudDecoder } from './IParseCloudDecoder';
import { IParseDecoder } from '../../encoding/IParseDecoder';
import { IParseObjectDecoder } from '../../encoding/IParseObjectDecoder';
import { IObjectState } from '../../object/state/IObjectState';

export class ParseCloudDecoder implements IParseCloudDecoder {

    protected _decoder: IParseDecoder;
    protected _objectDecoder: IParseObjectDecoder;

    constructor(decoder: IParseDecoder, objectDecoder: IParseObjectDecoder) {
        this._decoder = decoder;
        this._objectDecoder = objectDecoder;
    }
    
    decodeParseObject(serverResponse: { [key: string]: any }): IObjectState {
        return this._objectDecoder.decode(serverResponse, this._decoder);
    }

    decodeDictionary(serverResponse: { [key: string]: any }): { [key: string]: any } {
        return this._decoder.decode(serverResponse);
    }
}