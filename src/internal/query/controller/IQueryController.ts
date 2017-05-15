import { IObjectState } from '../../object/state/IObjectState';
import { RxAVQuery } from '../../../public/RxAVQuery';
import { Observable } from 'rxjs';

export /**
 * IQueryController
 */
    interface IQueryController {
    find(query: RxAVQuery, sessionToken: string): Observable<Array<IObjectState>>;
    count(query: RxAVQuery, sessionToken: string): Observable<number>;
    fitst(query: RxAVQuery, sessionToken: string): Observable<Array<IObjectState>>;

    //find<T>(): Observable<Array<IObjectState>>;

}