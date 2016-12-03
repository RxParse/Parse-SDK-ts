import { IObjectState } from '../state/IObjectState';
import { Observable } from 'rxjs';
export interface iObjectController {
    save(state: IObjectState, dictionary: {
        [key: string]: any;
    }, sessionToken: string): Observable<IObjectState>;
}
