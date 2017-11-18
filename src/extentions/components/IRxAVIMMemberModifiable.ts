import { Observable } from 'rxjs';

export interface IRxAVIMMemberModifiable {
    add(clientId: string): Observable<boolean>;
    remove(clientId: string): Observable<boolean>;
}