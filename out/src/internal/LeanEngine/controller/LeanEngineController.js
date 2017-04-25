"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const AVCommand_1 = require("../../command/AVCommand");
const SDKPlugins_1 = require("../../SDKPlugins");
class LeanEngineController {
    constructor(LeanEngineDecoder) {
        this._LeanEngineDecoder = LeanEngineDecoder;
    }
    callFunction(name, parameters, sessionToken) {
        let cmd = new AVCommand_1.AVCommand({
            relativeUrl: `/functions/${name}`,
            method: 'POST',
            data: parameters,
            sessionToken: sessionToken
        });
        return SDKPlugins_1.SDKPlugins.instance.CommandRunner.runRxCommand(cmd).map(res => {
            let result = this._LeanEngineDecoder.decodeDictionary(res.body.result);
            return result;
        });
    }
}
exports.LeanEngineController = LeanEngineController;
