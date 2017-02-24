import { Observable } from 'rxjs';
import { IStorage } from '../IStorage';
export interface IStorageController {
    isDirty: boolean;
    dictionary: {
        [key: string]: any;
    };
    provider: IStorage;
    load(): Observable<IStorage>;
    save(contents: {
        [key: string]: any;
    }): Observable<IStorage>;
    get(key: string): Observable<any>;
    set(key: string, value: any): Observable<IStorage>;
    remove(key: string): Observable<IStorage>;
}
