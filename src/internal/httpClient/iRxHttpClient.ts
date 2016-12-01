import { Observable } from 'rxjs';
import { HttpRequest } from './HttpRequest';

export interface iRxHttpClient {
    execute(httpRequest: HttpRequest): Observable<[number, any]>;
}
