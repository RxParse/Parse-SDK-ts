import { IObjectState } from '../state/IObjectState';
import { Observable } from 'rxjs';
import { IAVFieldOperation } from '../../operation/IAVFieldOperation';

export interface IObjectController {
    fetch(state: IObjectState, sessionToken: string): Observable<IObjectState>;
    save(state: IObjectState, operations: Map<string, IAVFieldOperation>, sessionToken: string): Observable<IObjectState>;
    delete(state: IObjectState, sessionToken: string): Observable<boolean>;
    batchSave(states: Array<IObjectState>, operationses: Array<Map<string, IAVFieldOperation>>, sessionToken: string): Observable<Array<IObjectState>>;
    batchDelete(states: Array<IObjectState>, sessionToken: string): Observable<Array<boolean>>;
}