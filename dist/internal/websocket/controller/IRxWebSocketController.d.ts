import { Observable } from 'rxjs';
import { HttpRequest } from '../../httpClient/HttpRequest';
import { HttpResponse } from '../../httpClient/HttpResponse';
import { IRxWebSocketClient } from '../IRxWebSocketClient';
export interface IRxWebSocketController {
    rxWebSocketClient: IRxWebSocketClient;
    open(url: string, protocols?: string | string[]): Observable<boolean>;
    execute(httpRequest: HttpRequest): Observable<HttpResponse>;
}
