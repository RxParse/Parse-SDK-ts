import { IObjectState } from '../../object/state/IObjectState';

export interface ILeanEngineDecoder {
    decodeAVObject(serverResponse: { [key: string]: any }): IObjectState;
    decodeDictionary(serverResponse: { [key: string]: any }): { [key: string]: any };
}