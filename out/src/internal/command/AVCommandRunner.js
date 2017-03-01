"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var rxjs_1 = require("rxjs");
var AVCommandResponse_1 = require("./AVCommandResponse");
var AVCommandRunner = (function () {
    function AVCommandRunner(rxHttpClient) {
        this._iRxHttpClient = rxHttpClient;
    }
    AVCommandRunner.prototype.runRxCommand = function (command) {
        return this._iRxHttpClient.execute(command).map(function (res) {
            return new AVCommandResponse_1.AVCommandResponse(res);
        }).catch(function (errorRes) {
            return rxjs_1.Observable.throw(errorRes);
        });
    };
    return AVCommandRunner;
}());
exports.AVCommandRunner = AVCommandRunner;
