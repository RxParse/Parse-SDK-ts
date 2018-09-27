import { map, catchError } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { ParseCommand } from './ParseCommand';
import { ParseCommandResponse } from './ParseCommandResponse';
import { IParseCommandRunner } from './IParseCommandRunner';
import { IRxHttpClient } from '../httpClient/IRxHttpClient';
import { ParseClient } from '../../public/RxParseClient';

export class ParseCommandRunner implements IParseCommandRunner {

    private _IRxHttpClient: IRxHttpClient;

    constructor(rxHttpClient: IRxHttpClient) {
        this._IRxHttpClient = rxHttpClient;
    }

    runRxCommand(command: ParseCommand): Observable<ParseCommandResponse> {
        ParseClient.printHttpLog(command);
        return this._IRxHttpClient.execute(command).pipe(map(res => {
            ParseClient.printHttpLog(null, res);
            return new ParseCommandResponse(res);
        })).pipe(catchError((errorRes) => {
            return Observable.throw(errorRes);
        }));
    }
}