//import WebSocket from 'ws';
var WebSocket = require('ws');
import { IRxWebSocketClient } from '../../src/RxLeanCloud';
import { Observable, Observer, Subject } from 'rxjs';

export class RxNodeJSWebSocketClient implements IRxWebSocketClient {
    wsc: any;
    url: string;
    protocols: string | string[];
    listeners: any = {};
    onMessage: Observable<any>;
    socket: Subject<any>;
    onClosed: Observable<{ wasClean: boolean; code: number; reason: string; }>;

    open(url: string, protocols?: string | string[]): Observable<boolean> {
        this.url = url;
        this.protocols = protocols;
        let rtn = new Promise<boolean>((resolve, reject) => {
            this.wsc = new WebSocket(this.url, this.protocols);
            this.wsc.on('open', () => {
                console.log('opened');
                this.onMessage = new Subject<any>();
                this.socket = new Subject<any>();
                this.onMessage = this.socket.asObservable();
                resolve(true);
            });
            this.wsc.on('error', (error) => {
                console.log('error');
                reject(error);
            });
            this.wsc.on('message', (data, flags) => {
                let rawResp = JSON.parse(data);
                console.log('websocket<=', data);
                for (var listener in this.listeners) {
                    if (rawResp.i.toString() == listener) {
                        this.listeners[listener](rawResp);
                        delete this.listeners[listener];
                    }
                }
                this.socket.next(rawResp);
            });
        });
        return Observable.fromPromise(rtn);
    }
    close(code?: number, data?: any): void {
        throw new Error('Method not implemented.');
    }
    send(data: any, options?: any): Observable<any> {
        let rawReq = JSON.stringify(data);
        this.wsc.send(rawReq);
        console.log('websocket=>', data);
        let rtn = new Promise<any>((resolve, reject) => {
            let fId = data.i.toString();
            this.listeners[fId] = (response) => {
                let resp = {};
                resp['body'] = response;
                resp['satusCode'] = 200;
                resolve(resp);
            };
        });
        return Observable.fromPromise(rtn);
    }
}