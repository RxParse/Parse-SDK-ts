import { Observable } from 'rxjs';
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
