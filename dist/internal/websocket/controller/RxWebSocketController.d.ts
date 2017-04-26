import { Observable } from 'rxjs';
import { HttpRequest } from '../../httpClient/HttpRequest';
import { HttpResponse } from '../../httpClient/HttpResponse';
import { IRxHttpClient } from '../../httpClient/iRxHttpClient';
import { IRxWebSocketClient } from '../IRxWebSocketClient';
import { IRxWebSocketController } from './IRxWebSocketController';
export declare class RxWebSocketController implements IRxHttpClient, IRxWebSocketController {
    rxWebSocketClient: IRxWebSocketClient;
    url: string;
    protocols: string | string[];
    constructor(_rxWebSocketClient: IRxWebSocketClient);
    open(url: string, protocols?: string | string[]): Observable<boolean>;
    execute(httpRequest: HttpRequest): Observable<HttpResponse>;
}
