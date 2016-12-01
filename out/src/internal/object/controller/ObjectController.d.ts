import { iObjectState } from '../state/iObjectState';
import { iObjectController } from './iObjectController';
import { Observable } from 'rxjs';
export declare class ObjectController implements iObjectController {
    save(state: iObjectState, dictionary: {
        [key: string]: any;
    }, sessionToken: string): Observable<iObjectState>;
}
