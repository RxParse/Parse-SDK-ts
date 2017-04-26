import { Observable, Observer, Subject } from 'rxjs';
import { HttpRequest } from '../../httpClient/HttpRequest';
import { HttpResponse } from '../../httpClient/HttpResponse';
import { IRxHttpClient } from '../../httpClient/iRxHttpClient';
import { RxAVClient } from '../../../public/RxAVClient';
import { IRxWebSocketClient } from '../IRxWebSocketClient';

export interface IRxWebSocketController {
    rxWebSocketClient: IRxWebSocketClient;
    open(url: string, protocols?: string | string[]): Observable<boolean>;
    execute(httpRequest: HttpRequest): Observable<HttpResponse>;
}