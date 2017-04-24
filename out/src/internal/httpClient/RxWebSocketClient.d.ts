import { Observable, Subject } from 'rxjs';
import { HttpRequest } from './HttpRequest';
import { HttpResponse } from './HttpResponse';
import { IRxHttpClient } from './iRxHttpClient';
export declare class RxWebSocketClient implements IRxHttpClient {
    wsc: any;
    url: string;
    protocols: string | string[];
    socket: Subject<any>;
    listeners: any;
    constructor(url: string, protocols?: string | string[]);
    open(): Observable<boolean>;
    execute(httpRequest: HttpRequest): Observable<HttpResponse>;
}
