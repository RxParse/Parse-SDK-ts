import { Observable, Observer, Subject } from 'rxjs';
import { HttpRequest } from '../../httpClient/HttpRequest';
import { HttpResponse } from '../../httpClient/HttpResponse';
import { IRxHttpClient } from '../../httpClient/IRxHttpClient';
import { RxAVClient } from '../../../public/RxAVClient';
import { IRxWebSocketClient } from '../IRxWebSocketClient';
import { AVCommand } from '../../command/AVCommand';
import { AVCommandResponse } from '../../command/AVCommandResponse';
import { IWebSocketClient } from '../IWebSocketClient';

export interface IRxWebSocketController {
    websocketClient: IWebSocketClient;
    onMessage: Observable<any>;
    onState: Observable<any>;
    open(url: string, protocols?: string | string[]): Observable<boolean>;
    execute(avCommand: AVCommand): Observable<AVCommandResponse>;
}