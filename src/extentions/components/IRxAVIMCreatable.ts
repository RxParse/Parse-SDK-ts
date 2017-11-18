import { Observable } from 'rxjs';

export interface IRxAVIMCreatable {
    create(): Observable<boolean>;
}