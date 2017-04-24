import { Observable, Observer, Subject } from 'rxjs';
import { HttpRequest } from './HttpRequest';
import { HttpResponse } from './HttpResponse';
import { IRxHttpClient } from './iRxHttpClient';
import { RxAVClient } from '../../public/RxAVClient';
const WebSocket = require('ws');
export class RxWebSocketClient implements IRxHttpClient {
    wsc: any;
    url: string;
    protocols: string | string[];
    socket: Subject<any>;
    listeners: any = {};
    constructor(url: string, protocols?: string | string[]) {
        this.url = url;
        this.protocols = protocols;
    }
    open() {
        let rtn = new Promise<boolean>((resolve, reject) => {
            this.wsc = new WebSocket(this.url, this.protocols);
            this.wsc.on('open', () => {
                console.log('opened');
                this.socket = new Subject<any>();
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
    execute(httpRequest: HttpRequest): Observable<HttpResponse> {
        let rawReq = JSON.stringify(httpRequest.data);
        this.wsc.send(rawReq);
        console.log('websocket=>', httpRequest.data);

        let rtn = new Promise<HttpResponse>((resolve, reject) => {
            let fId = httpRequest.data.i.toString();
            this.listeners[fId] = (response) => {
                let resp = new HttpResponse();
                resp.body = response;
                resp.satusCode = 200;
                resolve(resp);
            };
        });

        return Observable.fromPromise(rtn);
    }
}