import { Observable } from 'rxjs';
import { AVCommand } from './AVCommand';
import { AVCommandResponse } from './AVCommandResponse';
import { IAVCommandRunner } from './IAVCommandRunner';
import { IRxHttpClient } from '../httpClient/iRxHttpClient';
export declare class AVCommandRunner implements IAVCommandRunner {
    private _iRxHttpClient;
    constructor(rxHttpClient: IRxHttpClient);
    runRxCommand(command: AVCommand): Observable<AVCommandResponse>;
}
