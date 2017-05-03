import { Observable } from 'rxjs';
import { HttpRequest } from '../../httpClient/HttpRequest';
import { HttpResponse } from '../../httpClient/HttpResponse';
import { IRxHttpClient } from '../../httpClient/iRxHttpClient';
import { IRxWebSocketClient } from '../IRxWebSocketClient';
import { IRxWebSocketController } from './IRxWebSocketController';
import { IWebSocketClient } from '../IWebSocketClient';
export declare class RxWebSocketController implements IRxHttpClient, IRxWebSocketController {
    rxWebSocketClient: IRxWebSocketClient;
    websocketClient: IWebSocketClient;
    url: string;
    protocols: string | string[];
    onMessage: Observable<any>;
    onState: Observable<number>;
    constructor(_webSocketClient: IWebSocketClient);
    open(url: string, protocols?: string | string[]): Observable<boolean>;
    execute(httpRequest: HttpRequest): Observable<HttpResponse>;
}
