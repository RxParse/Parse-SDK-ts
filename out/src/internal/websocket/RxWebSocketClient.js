"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const HttpResponse_1 = require("../httpClient/HttpResponse");
const RxAVClient_1 = require("../../public/RxAVClient");
const RxNodeJSWebSocketClient_1 = require("./RxNodeJSWebSocketClient");
const RxBrowserWebSocketClient_1 = require("./RxBrowserWebSocketClient");
class RxWebSocketClient {
    constructor(url, protocols) {
        console.log(url, 'connecting...');
        this.url = url;
        this.protocols = protocols;
        if (RxAVClient_1.RxAVClient.instance.currentConfiguration.isNode) {
            this.rxWebSocketClient = new RxNodeJSWebSocketClient_1.RxNodeJSWebSocketClient();
        }
        else {
            this.rxWebSocketClient = new RxBrowserWebSocketClient_1.RxBrowserWebSocketClient();
        }
    }
    open() {
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
exports.RxWebSocketClient = RxWebSocketClient;
