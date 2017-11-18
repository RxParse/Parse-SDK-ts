import { Observable } from 'rxjs';

export interface IRxAVIMSendable {
    send(message: any): Observable<any>;
}