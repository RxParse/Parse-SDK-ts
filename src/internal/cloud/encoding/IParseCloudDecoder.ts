import { IObjectState } from '../../object/state/IObjectState';

export interface IParseCloudDecoder {
    decodeParseObject(serverResponse: { [key: string]: any }): IObjectState;
    decodeDictionary(serverResponse: { [key: string]: any }): { [key: string]: any };
}