"use strict";
var AVCommand_1 = require('../../command/AVCommand');
var SDKPlugins_1 = require('../../SDKPlugins');
var ObjectController = (function () {
    function ObjectController(commandRunner) {
        this._commandRunner = commandRunner;
    }
    ObjectController.prototype.save = function (state, dictionary, sessionToken) {
        var encoded = SDKPlugins_1.SDKPlugins.instance.Encoder.encode(dictionary);
        var cmd = new AVCommand_1.AVCommand({
            relativeUrl: "/classes/" + state.className,
            method: 'POST',
            data: encoded
        });
        return this._commandRunner.runRxCommand(cmd).map(function (res) {
            var serverState = SDKPlugins_1.SDKPlugins.instance.ObjectDecoder.decode(res.body, SDKPlugins_1.SDKPlugins.instance.Decoder);
            serverState = serverState.mutatedClone(function (s) {
                s.isNew = res.satusCode == 201;
            });
            return serverState;
        });
    };
    return ObjectController;
}());
exports.ObjectController = ObjectController;
