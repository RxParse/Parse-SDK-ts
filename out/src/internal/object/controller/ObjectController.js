"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const AVCommand_1 = require("../../command/AVCommand");
const SDKPlugins_1 = require("../../SDKPlugins");
class ObjectController {
    constructor(commandRunner) {
        this._commandRunner = commandRunner;
    }
    fetch(state, sessionToken) {
        let cmd = new AVCommand_1.AVCommand({
            app: state.app,
            relativeUrl: `/classes/${state.className}/${state.objectId}`,
            method: 'GET',
            data: null,
            sessionToken: sessionToken
        });
        return this._commandRunner.runRxCommand(cmd).map(res => {
            let serverState = SDKPlugins_1.SDKPlugins.instance.ObjectDecoder.decode(res.body, SDKPlugins_1.SDKPlugins.instance.Decoder);
            return serverState;
        });
    }
    clearReadonlyFields(dictionary) {
        if (Object.prototype.hasOwnProperty.call(dictionary, 'objectId')) {
            delete dictionary['objectId'];
        }
        if (Object.prototype.hasOwnProperty.call(dictionary, 'createdAt')) {
            delete dictionary['createdAt'];
        }
        if (Object.prototype.hasOwnProperty.call(dictionary, 'updatedAt')) {
            delete dictionary['updatedAt'];
        }
    }
    clearRelationFields(dictionary) {
        for (let key in dictionary) {
            let v = dictionary[key];
            if (Object.prototype.hasOwnProperty.call(v, '__type')) {
                if (v['__type'] == 'Relation') {
                    delete dictionary[key];
                }
            }
        }
    }
    copyToMutable(dictionary) {
        let newDictionary = {};
        for (let key in dictionary) {
            newDictionary[key] = dictionary[key];
        }
        return newDictionary;
    }
    packForSave(dictionary) {
        let mutableDictionary = this.copyToMutable(dictionary);
        this.clearReadonlyFields(mutableDictionary);
        this.clearRelationFields(mutableDictionary);
        return mutableDictionary;
    }
    save(state, dictionary, sessionToken) {
        let mutableDictionary = this.packForSave(dictionary);
        let encoded = SDKPlugins_1.SDKPlugins.instance.Encoder.encode(mutableDictionary);
        let cmd = new AVCommand_1.AVCommand({
            app: state.app,
            relativeUrl: state.objectId == null ? `/classes/${state.className}` : `/classes/${state.className}/${state.objectId}`,
            method: state.objectId == null ? 'POST' : 'PUT',
            data: encoded,
            sessionToken: sessionToken
        });
        return this._commandRunner.runRxCommand(cmd).map(res => {
            let serverState = SDKPlugins_1.SDKPlugins.instance.ObjectDecoder.decode(res.body, SDKPlugins_1.SDKPlugins.instance.Decoder);
            serverState = serverState.mutatedClone((s) => {
                s.isNew = res.satusCode == 201;
            });
            return serverState;
        });
    }
    batchSave(states, dictionaries, sessionToken) {
        let cmdArray = [];
        states.map((state, i, a) => {
            let mutableDictionary = this.packForSave(dictionaries[i]);
            let encoded = SDKPlugins_1.SDKPlugins.instance.Encoder.encode(mutableDictionary);
            let cmd = new AVCommand_1.AVCommand({
                app: state.app,
                relativeUrl: state.objectId == null ? `/1.1/classes/${state.className}` : `/1.1/classes/${state.className}/${state.objectId}`,
                method: state.objectId == null ? 'POST' : 'PUT',
                data: encoded,
                sessionToken: sessionToken
            });
            cmdArray.push(cmd);
        });
        return this.executeBatchCommands(cmdArray, sessionToken).map(batchRes => {
            return batchRes.map(res => {
                let serverState = SDKPlugins_1.SDKPlugins.instance.ObjectDecoder.decode(res, SDKPlugins_1.SDKPlugins.instance.Decoder);
                serverState = serverState.mutatedClone((s) => {
                    s.isNew = res['satusCode'] == 201;
                });
                return serverState;
            });
        });
    }
    executeBatchCommands(requests, sessionToken) {
        let rtn = [];
        let batchSize = requests.length;
        let encodedRequests = requests.map((cmd, i, a) => {
            let r = {
                method: cmd.method,
                path: cmd.relativeUrl
            };
            if (cmd.data != null) {
                r['body'] = cmd.data;
            }
            return r;
        });
        let batchRequest = new AVCommand_1.AVCommand({
            relativeUrl: '/batch',
            method: 'POST',
            data: { requests: encodedRequests }
        });
        return this._commandRunner.runRxCommand(batchRequest).map(res => {
            let resultsArray = res.body;
            let resultLength = resultsArray.length;
            if (resultLength != batchSize) {
                throw new Error(`Batch command result count expected: " + ${batchSize} + " but was: " + ${resultLength} + ".`);
            }
            for (let i = 0; i < batchSize; i++) {
                let result = resultsArray[i];
                if (Object.prototype.hasOwnProperty.call(result, 'success')) {
                    let subBody = result.success;
                    rtn.push(subBody);
                }
            }
            return rtn;
        });
    }
}
exports.ObjectController = ObjectController;
