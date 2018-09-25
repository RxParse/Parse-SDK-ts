import { IObjectState } from '../object/state/IObjectState';
import { IParseDecoder } from './IParseDecoder';

export interface IParseObjectDecoder {
    decode(serverResult: any, decoder: IParseDecoder): IObjectState;
}