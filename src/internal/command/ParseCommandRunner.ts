import { map, catchError } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { ParseCommand } from './ParseCommand';
import { ParseCommandResponse } from './ParseCommandResponse';
import { IParseCommandRunner } from './IParseCommandRunner';
import { IRxHttpClient } from '../httpClient/IRxHttpClient';
import { ILogController } from '../tool/controller/ILogController'

export class ParseCommandRunner implements IParseCommandRunner {

    private _IRxHttpClient: IRxHttpClient;
    private _logger: ILogController;

    constructor(rxHttpClient: IRxHttpClient, logger: ILogController) {
        this._IRxHttpClient = rxHttpClient;
        this._logger = logger;
    }

    runRxCommand(command: ParseCommand): Observable<ParseCommandResponse> {
        this._logger.log(command, null);
        return this._IRxHttpClient.execute(command).pipe(map(res => {
            this._logger.log(null, res);
            return new ParseCommandResponse(res);
        })).pipe(catchError((errorRes) => {
            return Observable.throw(errorRes);
        }));
    }
}