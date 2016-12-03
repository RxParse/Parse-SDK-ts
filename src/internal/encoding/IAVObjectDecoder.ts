import { IObjectState } from '../object/state/IObjectState';
import { IAVDecoder } from './IAVDecoder';

export interface IAVObjectDecoder {
    decode(serverResult: any, decoder: IAVDecoder): IObjectState;
}