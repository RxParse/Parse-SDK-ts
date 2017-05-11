import { Observable, Observer, Subject } from 'rxjs';
import { HttpRequest } from '../../httpClient/HttpRequest';
import { HttpResponse } from '../../httpClient/HttpResponse';
import { IRxHttpClient } from '../../httpClient/iRxHttpClient';
import { RxAVClient } from '../../../public/RxAVClient';
import { IRxWebSocketClient } from '../IRxWebSocketClient';
import { IRxWebSocketController } from './IRxWebSocketController';
import { IWebSocketClient } from '../IWebSocketClient';

export class RxWebSocketController implements IRxHttpClient, IRxWebSocketController {
    websocketClient: IWebSocketClient;
    url: string;
    protocols: string | string[];
    onMessage: Observable<any>;
    onState: Observable<number>;
    constructor(_webSocketClient: IWebSocketClient) {
        this.websocketClient = _webSocketClient;
    }

    open(url: string, protocols?: string | string[]): Observable<boolean> {
        if (this.websocketClient.readyState == 1) return Observable.from([true]);
        console.log(url, 'connecting...');
        this.url = url;
        this.protocols = protocols;
        this.websocketClient.open(url, protocols);

        this.onState = Observable.create(
            (obs: Observer<number>) => {
                this.websocketClient.onopen = (event) => {
                    console.log(url, 'connected.');
                    obs.next(this.websocketClient.readyState);
                };
                this.websocketClient.onerror = (event) => {
                    obs.next(this.websocketClient.readyState);
                };
                this.websocketClient.onclose = (event) => {
                    obs.next(this.websocketClient.readyState);
                };
            }
        );

        this.onMessage = Observable.create(
            (obs: Observer<string>) => {
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
            }
        );

        return this.onState.filter(readyState => {
            return readyState == 1;
        }).map(readyState => {
            return true;
        });;
    }

    execute(httpRequest: HttpRequest): Observable<HttpResponse> {
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
            let resp = new HttpResponse();
            resp.body = messageJSON;
            resp.satusCode = 200;
            return resp;
        });
    }
}