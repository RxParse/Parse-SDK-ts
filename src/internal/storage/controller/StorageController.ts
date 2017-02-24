import { IStorageController } from './IStorageController';
import { Observable } from 'rxjs';
import { IStorage } from '../IStorage';

export class StorageController implements IStorageController {
    private storageFileName: string = 'RxApplicationSettings';
    provider: IStorage;
    isDirty: boolean;
    dictionary: { [key: string]: any } = null;

    constructor(storageProvider?: IStorage) {
        if (storageProvider)
            this.provider = storageProvider;
    }

    load(): Observable<IStorage> {
        if (!this.provider) {
            console.warn('can not find a Storage Provider.');
            return Observable.from([null]);
        }
        let obs = Observable.fromPromise(this.provider.get(this.storageFileName));
        return obs.map(data => {
            this.dictionary = JSON.parse(data);
            this.isDirty = false;
            return this.provider;
        });
    }

    save(contents: { [key: string]: any }): Observable<IStorage> {
        this.dictionary = contents;
        if (!this.provider) {
            console.warn('can not find a Storage Provider.');
            return Observable.from([null]);
        }
        let jsonString = JSON.stringify(this.dictionary);
        this.provider.add(this.storageFileName, jsonString);
        return Observable.from([this.provider]);
    }

    get(key: string): Observable<any> {
        if (this.dictionary != null)
            return Observable.from([this.dictionary[key]]);
        else {
            return this.load().map(provider => {
                if (this.dictionary != null)
                    return this.dictionary[key];
                else return null;
            });
        }
    }

    set(key: string, value: any): Observable<IStorage> {
        if (this.dictionary == null) this.dictionary = {};
        this.isDirty = true;
        this.dictionary[key] = value;
        return this.save(this.dictionary);
    }
    remove(key: string): Observable<IStorage> {
        delete this.dictionary[key];
        return this.save(this.dictionary);
    }



}