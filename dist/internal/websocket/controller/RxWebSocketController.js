"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const rxjs_1 = require("rxjs");
const HttpResponse_1 = require("../../httpClient/HttpResponse");
class RxWebSocketController {
    constructor(_webSocketClient) {
        this.websocketClient = _webSocketClient;
    }
    open(url, protocols) {
        if (this.websocketClient.readyState == 1)
            return rxjs_1.Observable.from([true]);
        console.log(url, 'connecting...');
        this.url = url;
        this.protocols = protocols;
        this.websocketClient.open(url, protocols);
        this.onState = rxjs_1.Observable.create((obs) => {
            this.websocketClient.onopen = (event) => {
                obs.next(this.websocketClient.readyState);
            };
            this.websocketClient.onerror = (event) => {
                obs.next(this.websocketClient.readyState);
            };
            this.websocketClient.onclose = (event) => {
                obs.next(this.websocketClient.readyState);
            };
        });
        this.onMessage = rxjs_1.Observable.create((obs) => {
            this.websocketClient.onmessage = (event) => {
                let messageJson = JSON.parse(event.data);
                console.log('websocket<=', messageJson);
                obs.next(event.data);
            };
            this.websocketClient.onclose = (event) => {
                obs.complete();
            };
            this.websocketClient.onerror = (event) => {
                obs.error(event.stack);
            };
        });
        return this.onState.filter(readyState => {
            return readyState == 1;
        }).map(readyState => {
            return true;
        });
        ;
    }
    execute(httpRequest) {
        let rawReq = JSON.stringify(httpRequest.data);
        this.websocketClient.send(rawReq);
        console.log('websocket=>', rawReq);
        return this.onMessage.filter(message => {
            let messageJSON = JSON.parse(message);
            if (Object.prototype.hasOwnProperty.call(messageJSON, 'i') && Object.prototype.hasOwnProperty.call(httpRequest.data, 'i')) {
                return httpRequest.data.i == messageJSON.i;
            }
            return false;
        }).map(message => {
            let messageJSON = JSON.parse(message);
            let resp = new HttpResponse_1.HttpResponse();
            resp.body = messageJSON;
            resp.satusCode = 200;
            return resp;
        });
    }
}
exports.RxWebSocketController = RxWebSocketController;
