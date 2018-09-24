import { IObjectState } from '../../object/state/IObjectState';
import { RxParseQuery } from '../../../public/RxAVQuery';
import { Observable } from 'rxjs';

export /**
 * IQueryController
 */
    interface IQueryController {
    find(query: RxParseQuery, sessionToken: string): Observable<Array<IObjectState>>;
    count(query: RxParseQuery, sessionToken: string): Observable<number>;
    fitst(query: RxParseQuery, sessionToken: string): Observable<Array<IObjectState>>;

    //find<T>(): Observable<Array<IObjectState>>;

}