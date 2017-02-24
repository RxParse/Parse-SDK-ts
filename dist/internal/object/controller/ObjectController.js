"use strict";
var AVCommand_1 = require('../../command/AVCommand');
var SDKPlugins_1 = require('../../SDKPlugins');
var ObjectController = (function () {
    function ObjectController(commandRunner) {
        this._commandRunner = commandRunner;
    }
    ObjectController.prototype.fetch = function (state, sessionToken) {
        var cmd = new AVCommand_1.AVCommand({
            relativeUrl: "/classes/" + state.className + "/" + state.objectId,
            method: 'GET',
            data: null,
            sessionToken: sessionToken
        });
        return this._commandRunner.runRxCommand(cmd).map(function (res) {
            var serverState = SDKPlugins_1.SDKPlugins.instance.ObjectDecoder.decode(res.body, SDKPlugins_1.SDKPlugins.instance.Decoder);
            return serverState;
        });
    };
    ObjectController.prototype.clearReadonlyFields = function (dictionary) {
        if (Object.prototype.hasOwnProperty.call(dictionary, 'objectId')) {
            delete dictionary['objectId'];
        }
        if (Object.prototype.hasOwnProperty.call(dictionary, 'createdAt')) {
            delete dictionary['createdAt'];
        }
        if (Object.prototype.hasOwnProperty.call(dictionary, 'updatedAt')) {
            delete dictionary['updatedAt'];
        }
    };
    ObjectController.prototype.clearRelationFields = function (dictionary) {
        for (var key in dictionary) {
            var v = dictionary[key];
            if (Object.prototype.hasOwnProperty.call(v, '__type')) {
                if (v['__type'] == 'Relation') {
                    delete dictionary[key];
                }
            }
        }
    };
    ObjectController.prototype.copyToMutable = function (dictionary) {
        var newDictionary = {};
        for (var key in dictionary) {
            newDictionary[key] = dictionary[key];
        }
        return newDictionary;
    };
    ObjectController.prototype.packForSave = function (dictionary) {
        var mutableDictionary = this.copyToMutable(dictionary);
        this.clearReadonlyFields(mutableDictionary);
        this.clearRelationFields(mutableDictionary);
        return mutableDictionary;
    };
    ObjectController.prototype.save = function (state, dictionary, sessionToken) {
        var mutableDictionary = this.packForSave(dictionary);
        var encoded = SDKPlugins_1.SDKPlugins.instance.Encoder.encode(mutableDictionary);
        var cmd = new AVCommand_1.AVCommand({
            relativeUrl: state.objectId == null ? "/classes/" + state.className : "/classes/" + state.className + "/" + state.objectId,
            method: state.objectId == null ? 'POST' : 'PUT',
            data: encoded,
            sessionToken: sessionToken
        });
        return this._commandRunner.runRxCommand(cmd).map(function (res) {
            var serverState = SDKPlugins_1.SDKPlugins.instance.ObjectDecoder.decode(res.body, SDKPlugins_1.SDKPlugins.instance.Decoder);
            serverState = serverState.mutatedClone(function (s) {
                s.isNew = res.satusCode == 201;
            });
            return serverState;
        });
    };
    ObjectController.prototype.batchSave = function (states, dictionaries, sessionToken) {
        var _this = this;
        var cmdArray = [];
        states.map(function (state, i, a) {
            var mutableDictionary = _this.packForSave(dictionaries[i]);
            var encoded = SDKPlugins_1.SDKPlugins.instance.Encoder.encode(mutableDictionary);
            var cmd = new AVCommand_1.AVCommand({
                relativeUrl: state.objectId == null ? "/1.1/classes/" + state.className : "/1.1/classes/" + state.className + "/" + state.objectId,
                method: state.objectId == null ? 'POST' : 'PUT',
                data: encoded,
                sessionToken: sessionToken
            });
            cmdArray.push(cmd);
        });
        return this.executeBatchCommands(cmdArray, sessionToken).map(function (batchRes) {
            return batchRes.map(function (res) {
                var serverState = SDKPlugins_1.SDKPlugins.instance.ObjectDecoder.decode(res, SDKPlugins_1.SDKPlugins.instance.Decoder);
                serverState = serverState.mutatedClone(function (s) {
                    s.isNew = res['satusCode'] == 201;
                });
                return serverState;
            });
        });
    };
    ObjectController.prototype.executeBatchCommands = function (requests, sessionToken) {
        var rtn = [];
        var batchSize = requests.length;
        var encodedRequests = requests.map(function (cmd, i, a) {
            var r = {
                method: cmd.method,
                path: cmd.relativeUrl
            };
            if (cmd.data != null) {
                r['body'] = cmd.data;
            }
            return r;
        });
        var batchRequest = new AVCommand_1.AVCommand({
            relativeUrl: '/batch',
            method: 'POST',
            data: { requests: encodedRequests }
        });
        return this._commandRunner.runRxCommand(batchRequest).map(function (res) {
            var resultsArray = res.body;
            var resultLength = resultsArray.length;
            if (resultLength != batchSize) {
                throw new Error("Batch command result count expected: \" + " + batchSize + " + \" but was: \" + " + resultLength + " + \".");
            }
            for (var i = 0; i < batchSize; i++) {
                var result = resultsArray[i];
                if (Object.prototype.hasOwnProperty.call(result, 'success')) {
                    var subBody = result.success;
                    rtn.push(subBody);
                }
            }
            return rtn;
        });
    };
    return ObjectController;
}());
exports.ObjectController = ObjectController;
