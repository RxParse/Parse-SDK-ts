import { IObjectState } from '../state/IObjectState';
import { Observable } from '@reactivex/rxjs';
export interface IObjectController {
    save(state: IObjectState, dictionary: {
        [key: string]: any;
    }, sessionToken: string): Observable<IObjectState>;
    batchSave(states: Array<IObjectState>, dictionaries: Array<{
        [key: string]: any;
    }>, sessionToken: string): Observable<Array<IObjectState>>;
}
