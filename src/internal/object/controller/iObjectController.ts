import { IObjectState } from '../state/IObjectState';
import { Observable } from 'rxjs';

export interface IObjectController {
    fetch(state: IObjectState,sessionToken: string):Observable<IObjectState>;
    save(state: IObjectState, dictionary: { [key: string]: any }, sessionToken: string): Observable<IObjectState>;
    batchSave(states: Array<IObjectState>, dictionaries: Array<{ [key: string]: any }>, sessionToken: string): Observable<Array<IObjectState>>;
}