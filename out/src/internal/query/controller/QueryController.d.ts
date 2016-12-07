import { IObjectState } from '../../object/state/IObjectState';
import { IQueryController } from './IQueryController';
import { IAVCommandRunner } from '../../command/IAVCommandRunner';
import { RxAVQuery } from '../../../RxLeancloud';
import { Observable } from 'rxjs';
export declare class QueryController implements IQueryController {
    private readonly _commandRunner;
    constructor(commandRunner: IAVCommandRunner);
    find(query: RxAVQuery, sessionToken: string): Observable<Array<IObjectState>>;
    count(query: RxAVQuery, sesstionToken: string): Observable<number>;
    fitst(query: RxAVQuery, sesstionToken: string): Observable<Array<IObjectState>>;
    buildQueryString(query: RxAVQuery): string;
}
