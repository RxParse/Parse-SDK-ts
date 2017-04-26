import { Observable, Observer, Subject } from 'rxjs';
import { HttpRequest } from '../../httpClient/HttpRequest';
import { HttpResponse } from '../../httpClient/HttpResponse';
import { IRxHttpClient } from '../../httpClient/iRxHttpClient';
import { RxAVClient } from '../../../public/RxAVClient';
import { IRxWebSocketClient } from '../IRxWebSocketClient';
import { IRxWebSocketController } from './IRxWebSocketController';

export class RxWebSocketController implements IRxHttpClient, IRxWebSocketController {
    rxWebSocketClient: IRxWebSocketClient;
    url: string;
    protocols: string | string[];
    constructor(_rxWebSocketClient: IRxWebSocketClient) {
        this.rxWebSocketClient = _rxWebSocketClient;
    }
    open(url: string, protocols?: string | string[]): Observable<boolean> {
        console.log(url, 'connecting...');
        this.url = url;
        this.protocols = protocols;
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