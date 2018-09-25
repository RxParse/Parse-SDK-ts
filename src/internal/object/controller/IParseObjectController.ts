import { IObjectState } from '../state/IObjectState';
import { Observable } from 'rxjs';
import { IParseFieldOperation } from '../../operation/IParseFieldOperation';

export interface IObjectController {
    fetch(state: IObjectState, sessionToken: string): Observable<IObjectState>;
    save(state: IObjectState, operations: Map<string, IParseFieldOperation>, sessionToken: string): Observable<IObjectState>;
    delete(state: IObjectState, sessionToken: string): Observable<boolean>;
    batchSave(states: Array<IObjectState>, operations: Array<Map<string, IParseFieldOperation>>, sessionToken: string): Observable<Array<IObjectState>>;
    batchDelete(states: Array<IObjectState>, sessionToken: string): Observable<Array<boolean>>;
}