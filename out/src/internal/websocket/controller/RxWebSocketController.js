"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const rxjs_1 = require("rxjs");
const HttpResponse_1 = require("../../httpClient/HttpResponse");
class RxWebSocketController {
    constructor(_rxWebSocketClient) {
        this.rxWebSocketClient = _rxWebSocketClient;
    }
    open(url, protocols) {
        if (this.rxWebSocketClient.state == 'connected')
            return rxjs_1.Observable.from([true]);
        console.log(url, 'connecting...');
        this.url = url;
        this.protocols = protocols;
        return this.rxWebSocketClient.open(this.url, this.protocols);
    }
    execute(httpRequest) {
        return this.rxWebSocketClient.send(httpRequest.data).map(response => {
            let resp = new HttpResponse_1.HttpResponse();
            resp.body = response;
            resp.satusCode = 200;
            return resp;
        });
    }
}
exports.RxWebSocketController = RxWebSocketController;
