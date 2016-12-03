import { Observable } from 'rxjs';
import { AVCommand } from './AVCommand';
import { AVCommandResponse } from './AVCommandResponse';
import { HttpResponse } from '../httpClient/HttpResponse';
import { IAVCommandRunner } from './IAVCommandRunner';
import { IRxHttpClient } from '../httpClient/iRxHttpClient';

export class AVCommandRunner implements IAVCommandRunner {

    private _iRxHttpClient: IRxHttpClient;

    constructor(rxHttpClient: IRxHttpClient) {
        this._iRxHttpClient = rxHttpClient;
    }

    runRxCommand(command: AVCommand): Observable<AVCommandResponse> {
        return this._iRxHttpClient.execute(command).map(res => {
            return new AVCommandResponse(res);
        }).catch((errorRes) => {
            return Observable.throw(errorRes);
        });
    }
}