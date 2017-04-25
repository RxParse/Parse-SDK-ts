import { Observable } from 'rxjs';
import { HttpRequest } from '../httpClient/HttpRequest';
import { HttpResponse } from '../httpClient/HttpResponse';
import { IRxHttpClient } from '../httpClient/iRxHttpClient';
import { IRxWebSocketClient } from './IRxWebSocketClient';
export declare class RxWebSocketClient implements IRxHttpClient {
    rxWebSocketClient: IRxWebSocketClient;
    url: string;
    protocols: string | string[];
    constructor(url: string, protocols?: string | string[]);
    open(): Observable<boolean>;
    execute(httpRequest: HttpRequest): Observable<HttpResponse>;
}
