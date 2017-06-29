import { IStorageController } from './IStorageController';
import { Observable } from 'rxjs';
import { IStorage } from '../IStorage';

export class StorageController implements IStorageController {
    private storageFileName: string = 'RxApplicationSettings';
    provider: IStorage;
    isDirty: boolean;
    hasLoaded: boolean = false;
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
            if (data)
                this.dictionary = JSON.parse(data);
            else this.dictionary = {};
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
        if (this.dictionary && this.dictionary != null) {
            let jsonString = JSON.stringify(this.dictionary);
            let save = this.provider.add(this.storageFileName, jsonString);
            return Observable.fromPromise(save).map(success => {
                return this.provider;
            });
        } else {
            return Observable.fromPromise(this.provider.remove(this.storageFileName)).map(removed => {
                console.log('empty cache with key ' + this.storageFileName);
                return this.provider;
            });
        }
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
        let loaded = Observable.from([this.provider]);
        if (!this.hasLoaded) {
            loaded = this.load();
        }
        return loaded.flatMap(provider => {
            this.isDirty = true;
            this.dictionary[key] = value;
            return this.save(this.dictionary);
        });
    }
    remove(key: string): Observable<IStorage> {
        if (this.dictionary[key]) {
            delete this.dictionary[key];
        }
        return this.save(this.dictionary);
    }
}