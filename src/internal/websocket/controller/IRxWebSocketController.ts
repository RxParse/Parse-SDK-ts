import { Observable } from 'rxjs';
import { ParseCommand } from '../../command/ParseCommand';
import { ParseCommandResponse } from '../../command/ParseCommandResponse';
import { IWebSocketClient } from '../IWebSocketClient';

export interface IRxWebSocketController {
    websocketClient: IWebSocketClient;
    onMessage: Observable<any>;
    onState: Observable<any>;
    open(url: string, protocols?: string | string[]): Observable<boolean>;
    send(data: ArrayBuffer | string | Blob): void;
    execute(avCommand: ParseCommand): Observable<ParseCommandResponse>;
}