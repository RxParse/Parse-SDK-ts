import { IObjectState } from '../object/state/IObjectState';
import { MutableObjectState } from '../object/state/MutableObjectState';
import { IAVObjectDecoder } from './IAVObjectDecoder';
import { IAVDecoder } from './IAVDecoder';
export declare class AVObjectDecoder implements IAVObjectDecoder {
    constructor();
    decode(serverResult: any, decoder: IAVDecoder): IObjectState;
    handlerCreateResult(state: MutableObjectState, createResult: any, decoder: IAVDecoder): IObjectState;
}
