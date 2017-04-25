"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const MutableObjectState_1 = require("../object/state/MutableObjectState");
class AVObjectDecoder {
    constructor() {
    }
    decode(serverResult, decoder) {
        let state = new MutableObjectState_1.MutableObjectState();
        this.handlerServerResult(state, serverResult, decoder);
        return state;
    }
    handlerServerResult(state, serverResult, decoder) {
        let mutableData = {};
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
                if (value['__type'] == 'Pointer') {
                    let rxAVObject = decoder.decodeItem(value);
                    let serverState = this.decode(value, decoder);
                    rxAVObject.handleFetchResult(serverState);
                    mutableData[key] = rxAVObject;
                }
                else {
                    mutableData[key] = decoder.decodeItem(value);
                }
            }
            else {
                mutableData[key] = value;
            }
        }
        state.serverData = mutableData;
        state.isNew = true;
        return state;
    }
}
exports.AVObjectDecoder = AVObjectDecoder;
