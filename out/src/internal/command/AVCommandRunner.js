"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const rxjs_1 = require("rxjs");
const AVCommandResponse_1 = require("./AVCommandResponse");
class AVCommandRunner {
    constructor(rxHttpClient) {
        this._iRxHttpClient = rxHttpClient;
    }
    runRxCommand(command) {
        return this._iRxHttpClient.execute(command).map(res => {
            return new AVCommandResponse_1.AVCommandResponse(res);
        }).catch((errorRes) => {
            return rxjs_1.Observable.throw(errorRes);
        });
    }
}
exports.AVCommandRunner = AVCommandRunner;
