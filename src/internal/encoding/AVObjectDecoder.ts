import { IObjectState } from '../object/state/IObjectState';
import { MutableObjectState } from '../object/state/MutableObjectState';
import { IAVObjectDecoder } from './IAVObjectDecoder';
import { IAVDecoder } from './IAVDecoder';

export /**
 * AVDecoder
 */
    class AVObjectDecoder implements IAVObjectDecoder {
    constructor() {
    }

    decode(serverResult: any, decoder: IAVDecoder): IObjectState {
        let state = new MutableObjectState();
        this.handlerServerResult(state, serverResult, decoder);
        return state;
    }

    handlerServerResult(state: MutableObjectState, serverResult: any, decoder: IAVDecoder): IObjectState {
        let mutableData: { [key: string]: any } = {};
        if (serverResult.createdAt) {
            state.createdAt = serverResult.createdAt;
            state.updatedAt = serverResult.createdAt;
            delete serverResult.createdAt;
        }
        if (serverResult.updatedAt) {
            state.updatedAt = serverResult.updatedAt;
            delete serverResult.updatedAt;
        }
        if (serverResult.objectId) {
            state.objectId = serverResult.objectId;
            delete serverResult.objectId;
        }
        
        for (let key in serverResult) {
            var value = serverResult[key];
            if (Object.prototype.hasOwnProperty.call(value, '__type') || Object.prototype.hasOwnProperty.call(value, 'className')) {
                mutableData[key] = decoder.decodeItem(value);
            } else {
                mutableData[key] = value;
            }
        }
        state.serverData = mutableData;
        state.isNew = true;
        return state;
    }
}