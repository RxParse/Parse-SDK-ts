import { Observable } from '@reactivex/rxjs';
import { HttpRequest } from './HttpRequest';
import { HttpResponse } from './HttpResponse';

export interface IRxHttpClient {
    execute(httpRequest: HttpRequest): Observable<HttpResponse>;
}
