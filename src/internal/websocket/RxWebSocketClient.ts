import { Observable, Observer, Subject } from 'rxjs';
import { HttpRequest } from '../httpClient/HttpRequest';
import { HttpResponse } from '../httpClient/HttpResponse';
import { IRxHttpClient } from '../httpClient/iRxHttpClient';
import { RxAVClient } from '../../public/RxAVClient';
import { IRxWebSocketClient } from './IRxWebSocketClient';
import { RxNodeJSWebSocketClient } from './RxNodeJSWebSocketClient';
import { RxBrowserWebSocketClient } from './RxBrowserWebSocketClient';

export class RxWebSocketClient implements IRxHttpClient {
    rxWebSocketClient: IRxWebSocketClient;
    url: string;
    protocols: string | string[];

    constructor(url: string, protocols?: string | string[]) {
        console.log(url, 'connecting...');
        this.url = url;
        this.protocols = protocols;
        if (RxAVClient.instance.currentConfiguration.isNode) {
            this.rxWebSocketClient = new RxNodeJSWebSocketClient();
        } else {
            this.rxWebSocketClient = new RxBrowserWebSocketClient();
        }
    }
    open(): Observable<boolean> {
        return this.rxWebSocketClient.open(this.url, this.protocols);
    }
    execute(httpRequest: HttpRequest): Observable<HttpResponse> {
        return this.rxWebSocketClient.send(httpRequest.data).map(response => {
            let resp = new HttpResponse();
            resp.body = response;
            resp.satusCode = 200;
            return resp;
        });
    }
}