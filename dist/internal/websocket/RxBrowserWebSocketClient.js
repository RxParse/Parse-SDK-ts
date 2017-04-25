"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const rxjs_1 = require("rxjs");
class RxBrowserWebSocketClient {
    constructor() {
        this.listeners = {};
    }
    open(url, protocols) {
        this.url = url;
        this.protocols = protocols;
        let rtn = new Promise((resolve, reject) => {
            this.wsc = new WebSocket(this.url, this.protocols);
            this.wsc.onopen = () => {
                console.log('opened');
                this.socket = new rxjs_1.Subject();
                this.onMessage = this.socket.asObservable();
                resolve(true);
            };
            this.wsc.onerror = (error) => {
                console.log('error');
                reject(error);
            };
            this.wsc.onmessage = (message) => {
                let rawResp = JSON.parse(message.data);
                console.log('websocket<=', message.data);
                for (var listener in this.listeners) {
                    if (rawResp.i.toString() == listener) {
                        this.listeners[listener](rawResp);
                        delete this.listeners[listener];
                    }
                }
                this.socket.next(rawResp);
            };
        });
        return rxjs_1.Observable.fromPromise(rtn);
    }
    close(code, data) {
        throw new Error('Method not implemented.');
    }
    send(data, options) {
        let rawReq = JSON.stringify(data);
        this.wsc.send(rawReq);
        console.log('websocket=>', data);
        let rtn = new Promise((resolve, reject) => {
            let fId = data.i.toString();
            this.listeners[fId] = (response) => {
                let resp = {};
                resp['body'] = response;
                resp['satusCode'] = 200;
                resolve(resp);
            };
        });
        return rxjs_1.Observable.fromPromise(rtn);
    }
}
exports.RxBrowserWebSocketClient = RxBrowserWebSocketClient;
