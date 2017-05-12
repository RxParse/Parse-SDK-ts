"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const AVCommand_1 = require("../../command/AVCommand");
const SDKPlugins_1 = require("../../SDKPlugins");
class UserController {
    constructor(commandRunner) {
        this._commandRunner = commandRunner;
    }
    signUp(state, dictionary) {
        let encoded = SDKPlugins_1.SDKPlugins.instance.Encoder.encode(dictionary);
        let cmd = new AVCommand_1.AVCommand({
            app: state.app,
            relativeUrl: "/users",
            method: 'POST',
            data: encoded
        });
        return this._commandRunner.runRxCommand(cmd).map(res => {
            let serverState = SDKPlugins_1.SDKPlugins.instance.ObjectDecoder.decode(res.body, SDKPlugins_1.SDKPlugins.instance.Decoder);
            serverState = serverState.mutatedClone((s) => {
                s.isNew = true;
            });
            return serverState;
        });
    }
    logIn(username, password) {
        let data = {
            "username": username,
            "password": password
        };
        let cmd = new AVCommand_1.AVCommand({
            relativeUrl: "/login",
            method: 'POST',
            data: data
        });
        return this._commandRunner.runRxCommand(cmd).map(res => {
            let serverState = SDKPlugins_1.SDKPlugins.instance.ObjectDecoder.decode(res.body, SDKPlugins_1.SDKPlugins.instance.Decoder);
            return serverState;
        });
    }
    logInWithParamters(relativeUrl, data) {
        let encoded = SDKPlugins_1.SDKPlugins.instance.Encoder.encode(data);
        let cmd = new AVCommand_1.AVCommand({
            relativeUrl: relativeUrl,
            method: 'POST',
            data: data
        });
        return this._commandRunner.runRxCommand(cmd).map(res => {
            let serverState = SDKPlugins_1.SDKPlugins.instance.ObjectDecoder.decode(res.body, SDKPlugins_1.SDKPlugins.instance.Decoder);
            serverState = serverState.mutatedClone((s) => {
                s.isNew = res.satusCode == 201;
            });
            return serverState;
        });
    }
    getUser(sessionToken) {
        return null;
    }
}
exports.UserController = UserController;
