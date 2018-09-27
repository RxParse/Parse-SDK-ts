//import WebSocket from 'ws';
var WebSocket = require('ws');
import { IWebSocketClient } from '../../src/RxParse';

export class NodeJSWebSocketClient implements IWebSocketClient {
    newInstance(): IWebSocketClient {
        return new NodeJSWebSocketClient();
    }
    onopen: (event: { target: NodeJSWebSocketClient }) => void;
    onerror: (err: Error) => void;
    onclose: (event: { wasClean: boolean; code: number; reason: string; target: NodeJSWebSocketClient }) => void;
    onmessage: (event: { data: any; type: string; target: NodeJSWebSocketClient }) => void;
    readyState: number;
    wsc: any;
    open(url: string, protocols?: string | string[]) {
        this.wsc = new WebSocket(url, protocols);
        this.readyState = 0;

        this.wsc.onmessage = (event: { data: any; type: string; target: any }): void => {
            this.onmessage({ data: event.data, type: event.type, target: this });
        };
        this.wsc.onclose = (event: { wasClean: boolean; code: number; reason: string; target: any }): void => {
            this.readyState = 3;
            this.onclose({ wasClean: event.wasClean, code: event.code, reason: event.reason, target: this });
        };

        this.wsc.onerror = (err: Error): void => {
            this.onerror(err);
        };

        this.wsc.onopen = (event: { target: any }): void => {
            this.readyState = 1;
            this.onopen({ target: this });
        };
    }

    close(code?: number, data?: any): void {
        this.readyState = 2;
        this.wsc.close(code, data);
    }
    send(data: ArrayBuffer | string | Blob) {
        this.wsc.send(data);
    }
}