import { SDKPlugins } from '../internal/SDKPlugins';
import { iObjectState } from '../internal/object/state/iObjectState';
import { Observable } from 'rxjs/Observable';

const _hasOwnProperty = Object.prototype.hasOwnProperty;
export const has = function (obj: any, prop: any) {
    return _hasOwnProperty.call(obj, prop);
};
export class RxAVObject implements iObjectState {
    isNew: boolean;
    className: string;
    objectId: string;
    updatedAt: Date;
    createdAt: Date;
    dictionary: { [key: string]: any };

    containsKey(key: string): boolean {
        return has(this.dictionary, key);
    }

    set(key: string, value: any) {
        this.dictionary[key] = value;
    }

    get(key: string) {
        return this.dictionary[key];
    }

    constructor(className: string) {
        this.className = className;
        this.dictionary = {};
    }
    save(): Observable<boolean> {
        for (let key in this.dictionary) {
            let x = this.dictionary[key]; // x: boolean
            console.log(key, x);
        }
        return SDKPlugins.instance.ObjectControllerInstance.save(this, this.dictionary, '').map(project => {
            return this.objectId != null;
        });
    }
}