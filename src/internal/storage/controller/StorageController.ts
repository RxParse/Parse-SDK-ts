import { IStorageController } from './IStorageController';
import { Observable, from } from 'rxjs';
import { map, catchError, flatMap } from 'rxjs/operators';
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
            return from([null]);
        }
        let obs = from(this.provider.get(this.storageFileName));
        return obs.pipe(map(data => {
            if (data) {
                let firstJson = JSON.parse(data);
                if (typeof firstJson == 'string') {
                    this.dictionary = JSON.parse(firstJson);
                } else {
                    this.dictionary = firstJson;
                }
            }
            else this.dictionary = {};
            this.isDirty = false;
            return this.provider;
        }));
    }

    save(contents: { [key: string]: any }): Observable<IStorage> {
        this.dictionary = contents;
        if (!this.provider) {
            console.warn('can not find a Storage Provider.');
            return from([null]);
        }
        if (this.dictionary && this.dictionary != null) {
            let jsonString = JSON.stringify(this.dictionary);
            let save = this.provider.add(this.storageFileName, jsonString);
            return from(save).pipe(map(success => {
                return this.provider;
            }));
        } else {
            return from(this.provider.remove(this.storageFileName)).pipe(map(removed => {
                console.log('empty cache with key ' + this.storageFileName);
                return this.provider;
            }));
        }
    }

    get(key: string): Observable<any> {
        if (this.dictionary != null)
            return from([this.dictionary[key]]);
        else {
            return this.load().pipe(map(provider => {
                if (this.dictionary != null)
                    return this.dictionary[key];
                else return null;
            }));
        }
    }

    set(key: string, value: any): Observable<IStorage> {
        let loaded = from([this.provider]);
        if (!this.hasLoaded) {
            loaded = this.load();
        }
        return loaded.pipe(flatMap(provider => {
            this.isDirty = true;
            this.dictionary[key] = value;
            return this.save(this.dictionary);
        }));
    }
    remove(key: string): Observable<IStorage> {
        if (this.dictionary[key]) {
            delete this.dictionary[key];
        }
        return this.save(this.dictionary);
    }
}