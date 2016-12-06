import { Observable } from '@reactivex/rxjs';
import { AVCommand } from './AVCommand';
import { AVCommandResponse } from './AVCommandResponse';

export interface IAVCommandRunner {
    runRxCommand(command: AVCommand): Observable<AVCommandResponse>;
}