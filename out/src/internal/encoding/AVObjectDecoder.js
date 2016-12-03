"use strict";
var MutableObjectState_1 = require('../object/state/MutableObjectState');
var AVObjectDecoder = (function () {
    function AVObjectDecoder() {
    }
    AVObjectDecoder.prototype.decode = function (serverResult, decoder) {
        var state = new MutableObjectState_1.MutableObjectState();
        this.handlerCreateResult(state, serverResult, decoder);
        return state;
    };
    AVObjectDecoder.prototype.handlerCreateResult = function (state, createResult, decoder) {
        if (createResult.createdAt) {
            state.createdAt = createResult.createdAt;
            state.updatedAt = createResult.createdAt;
        }
        if (createResult.updatedAt) {
            state.updatedAt = createResult.updatedAt;
        }
        if (createResult.objectId) {
            state.objectId = createResult.objectId;
        }
        state.serverData = decoder.decode(createResult);
        state.isNew = true;
        return state;
    };
    return AVObjectDecoder;
}());
exports.AVObjectDecoder = AVObjectDecoder;
