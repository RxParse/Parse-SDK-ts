"use strict";
var AVCommand_1 = require('../../command/AVCommand');
var SDKPlugins_1 = require('../../SDKPlugins');
var LeanEngineController = (function () {
    function LeanEngineController(LeanEngineDecoder) {
        this._LeanEngineDecoder = LeanEngineDecoder;
    }
    LeanEngineController.prototype.callFunction = function (name, parameters, sessionToken) {
        var _this = this;
        var cmd = new AVCommand_1.AVCommand({
            relativeUrl: "/functions/" + name,
            method: 'POST',
            data: parameters,
            sessionToken: sessionToken
        });
        return SDKPlugins_1.SDKPlugins.instance.CommandRunner.runRxCommand(cmd).map(function (res) {
            var result = _this._LeanEngineDecoder.decodeDictionary(res.body);
            return result;
        });
    };
    return LeanEngineController;
}());
exports.LeanEngineController = LeanEngineController;
