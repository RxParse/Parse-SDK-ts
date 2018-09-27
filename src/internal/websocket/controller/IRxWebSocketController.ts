import { Observable, Observer, Subject } from 'rxjs';
import { HttpRequest } from '../../httpClient/HttpRequest';
import { HttpResponse } from '../../httpClient/HttpResponse';
import { IRxHttpClient } from '../../httpClient/IRxHttpClient';
import { ParseClient } from 'public/RxParseClient';
import { IRxWebSocketClient } from '../IRxWebSocketClient';
import { ParseCommand } from '../../command/ParseCommand';
import { ParseCommandResponse } from '../../command/ParseCommandResponse';
import { IWebSocketClient } from '../IWebSocketClient';

export interface IRxWebSocketController {
    websocketClient: IWebSocketClient;
    onMessage: Observable<any>;
    onState: Observable<any>;
    open(url: string, protocols?: string | string[]): Observable<boolean>;
    send(data: ArrayBuffer | string | Blob):void;
    execute(avCommand: ParseCommand): Observable<ParseCommandResponse>;
}