"use strict";
var AVCommand_1 = require('../../command/AVCommand');
var SDKPlugins_1 = require('../../SDKPlugins');
var UserController = (function () {
    function UserController(commandRunner) {
        this._commandRunner = commandRunner;
    }
    UserController.prototype.signUp = function (state, dictionary) {
        var encoded = SDKPlugins_1.SDKPlugins.instance.Encoder.encode(dictionary);
        var cmd = new AVCommand_1.AVCommand({
            relativeUrl: "/users",
            method: 'POST',
            data: encoded
        });
        return this._commandRunner.runRxCommand(cmd).map(function (res) {
            var serverState = SDKPlugins_1.SDKPlugins.instance.ObjectDecoder.decode(res.body, SDKPlugins_1.SDKPlugins.instance.Decoder);
            serverState = serverState.mutatedClone(function (s) {
                s.isNew = true;
            });
            return serverState;
        });
    };
    UserController.prototype.logIn = function (username, password) {
        var data = {
            "username": username,
            "password": password
        };
        var cmd = new AVCommand_1.AVCommand({
            relativeUrl: "/login",
            method: 'POST',
            data: data
        });
        return this._commandRunner.runRxCommand(cmd).map(function (res) {
            var serverState = SDKPlugins_1.SDKPlugins.instance.ObjectDecoder.decode(res.body, SDKPlugins_1.SDKPlugins.instance.Decoder);
            return serverState;
        });
    };
    UserController.prototype.logInWithParamters = function (relativeUrl, data) {
        var encoded = SDKPlugins_1.SDKPlugins.instance.Encoder.encode(data);
        var cmd = new AVCommand_1.AVCommand({
            relativeUrl: relativeUrl,
            method: 'POST',
            data: data
        });
        return this._commandRunner.runRxCommand(cmd).map(function (res) {
            var serverState = SDKPlugins_1.SDKPlugins.instance.ObjectDecoder.decode(res.body, SDKPlugins_1.SDKPlugins.instance.Decoder);
            serverState = serverState.mutatedClone(function (s) {
                s.isNew = res.satusCode == 201;
            });
            return serverState;
        });
    };
    UserController.prototype.getUser = function (sessionToken) {
        return null;
    };
    return UserController;
}());
exports.UserController = UserController;
