"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const rxjs_1 = require("rxjs");
class StorageController {
    constructor(storageProvider) {
        this.storageFileName = 'RxApplicationSettings';
        this.dictionary = null;
        if (storageProvider)
            this.provider = storageProvider;
    }
    load() {
        if (!this.provider) {
            console.warn('can not find a Storage Provider.');
            return rxjs_1.Observable.from([null]);
        }
        let obs = rxjs_1.Observable.fromPromise(this.provider.get(this.storageFileName));
        return obs.map(data => {
            this.dictionary = JSON.parse(data);
            this.isDirty = false;
            return this.provider;
        });
    }
    save(contents) {
        this.dictionary = contents;
        if (!this.provider) {
            console.warn('can not find a Storage Provider.');
            return rxjs_1.Observable.from([null]);
        }
        let jsonString = JSON.stringify(this.dictionary);
        this.provider.add(this.storageFileName, jsonString);
        return rxjs_1.Observable.from([this.provider]);
    }
    get(key) {
        if (this.dictionary != null)
            return rxjs_1.Observable.from([this.dictionary[key]]);
        else {
            return this.load().map(provider => {
                if (this.dictionary != null)
                    return this.dictionary[key];
                else
                    return null;
            });
        }
    }
    set(key, value) {
        if (this.dictionary == null)
            this.dictionary = {};
        this.isDirty = true;
        this.dictionary[key] = value;
        return this.save(this.dictionary);
    }
    remove(key) {
        delete this.dictionary[key];
        return this.save(this.dictionary);
    }
}
exports.StorageController = StorageController;
