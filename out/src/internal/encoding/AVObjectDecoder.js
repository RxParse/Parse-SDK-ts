"use strict";
var MutableObjectState_1 = require('../object/state/MutableObjectState');
var AVObjectDecoder = (function () {
    function AVObjectDecoder() {
    }
    AVObjectDecoder.prototype.decode = function (serverResult, decoder) {
        var state = new MutableObjectState_1.MutableObjectState();
        this.handlerServerResult(state, serverResult, decoder);
        return state;
    };
    AVObjectDecoder.prototype.handlerServerResult = function (state, serverResult, decoder) {
        var mutableData = {};
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
        for (var key in serverResult) {
            var value = serverResult[key];
            if (Object.prototype.hasOwnProperty.call(value, '__type') || Object.prototype.hasOwnProperty.call(value, 'className')) {
                mutableData[key] = decoder.decodeItem(value);
            }
            else {
                mutableData[key] = value;
            }
        }
        state.serverData = mutableData;
        state.isNew = true;
        return state;
    };
    return AVObjectDecoder;
}());
exports.AVObjectDecoder = AVObjectDecoder;
