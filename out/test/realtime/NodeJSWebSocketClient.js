"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
//import WebSocket from 'ws';
var WebSocket = require('ws');
class NodeJSWebSocketClient {
    open(url, protocols) {
        this.wsc = new WebSocket(url, protocols);
        this.readyState = 0;
        this.wsc.onmessage = (event) => {
            this.onmessage({ data: event.data, type: event.type, target: this });
        };
        this.wsc.onclose = (event) => {
            this.readyState = 3;
            this.onclose({ wasClean: event.wasClean, code: event.code, reason: event.reason, target: this });
        };
        this.wsc.onerror = (err) => {
            this.onerror(err);
        };
        this.wsc.onopen = (event) => {
            this.readyState = 1;
            this.onopen({ target: this });
        };
    }
    close(code, data) {
        this.readyState = 2;
        this.wsc.close(code, data);
    }
    send(data) {
        this.wsc.send(data);
    }
}
exports.NodeJSWebSocketClient = NodeJSWebSocketClient;
