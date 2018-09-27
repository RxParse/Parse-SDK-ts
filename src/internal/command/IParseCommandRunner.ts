import { Observable } from 'rxjs';
import { ParseCommand } from './ParseCommand';
import { ParseCommandResponse } from './ParseCommandResponse';

export interface IParseCommandRunner {
    runRxCommand(command: ParseCommand): Observable<ParseCommandResponse>;
}