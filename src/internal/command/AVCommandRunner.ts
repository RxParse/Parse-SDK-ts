import { Observable } from 'rxjs';
import { AVCommand } from './AVCommand';
import { AVCommandResponse } from './AVCommandResponse';
import { HttpResponse } from '../httpClient/HttpResponse';
import { IAVCommandRunner } from './IAVCommandRunner';
import { IRxHttpClient } from '../httpClient/IRxHttpClient';
import { RxParseClient } from '../../public/RxAVClient';

export class AVCommandRunner implements IAVCommandRunner {

    private _IRxHttpClient: IRxHttpClient;

    constructor(rxHttpClient: IRxHttpClient) {
        this._IRxHttpClient = rxHttpClient;
    }

    runRxCommand(command: AVCommand): Observable<AVCommandResponse> {
        return this._IRxHttpClient.execute(command).map(res => {
            RxParseClient.printHttpLog(command, res);
            return new AVCommandResponse(res);
        }).catch((errorRes) => {
            return Observable.throw(errorRes);
        });
    }
}