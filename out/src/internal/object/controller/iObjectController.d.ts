import { iObjectState } from '../state/iObjectState';
import { Observable } from 'rxjs';
export interface iObjectController {
    save(state: iObjectState, dictionary: {
        [key: string]: any;
    }, sessionToken: string): Observable<iObjectState>;
}
