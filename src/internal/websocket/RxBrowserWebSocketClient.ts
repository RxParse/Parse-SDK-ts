import { IRxWebSocketClient } from './IRxWebSocketClient';
import { Observable, Observer, Subject } from 'rxjs';

export class RxBrowserWebSocketClient implements IRxWebSocketClient {
    wsc: WebSocket;
    url: string;
    protocols: string | string[];
    socket: Subject<any>;
    listeners: any = {};
    onMessage: Observable<any>;
    onClosed: Observable<{ wasClean: boolean; code: number; reason: string; }>;

    open(url: string, protocols?: string | string[]): Observable<boolean> {
        this.url = url;
        this.protocols = protocols;
        let rtn = new Promise<boolean>((resolve, reject) => {
            this.wsc = new WebSocket(this.url, this.protocols);
            this.wsc.onopen = () => {
                console.log('opened');
                this.socket = new Subject<any>();
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