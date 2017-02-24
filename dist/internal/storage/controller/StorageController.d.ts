import { IStorageController } from './IStorageController';
import { Observable } from 'rxjs';
import { IStorage } from '../IStorage';
export declare class StorageController implements IStorageController {
    private storageFileName;
    provider: IStorage;
    isDirty: boolean;
    dictionary: {
        [key: string]: any;
    };
    constructor(storageProvider?: IStorage);
    load(): Observable<IStorage>;
    save(contents: {
        [key: string]: any;
    }): Observable<IStorage>;
    get(key: string): Observable<any>;
    set(key: string, value: any): Observable<IStorage>;
    remove(key: string): Observable<IStorage>;
}
