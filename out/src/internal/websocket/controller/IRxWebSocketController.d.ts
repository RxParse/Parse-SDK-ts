import { Observable } from 'rxjs';
import { IRxWebSocketClient } from '../IRxWebSocketClient';
import { AVCommand } from '../../command/AVCommand';
import { AVCommandResponse } from '../../command/AVCommandResponse';
export interface IRxWebSocketController {
    rxWebSocketClient: IRxWebSocketClient;
    open(url: string, protocols?: string | string[]): Observable<boolean>;
    execute(avCommand: AVCommand): Observable<AVCommandResponse>;
}
