import { Observable } from 'rxjs';
import { RxAVObject } from '../../public/RxAVObject';
import { RxAVQuery, RxAVLiveQuery } from '../../public/RxAVQuery';

export interface IRXAVIMProperties {
    topics: Array<any>;
    bulletins: Array<any>;
    owner: string;
    admins: Array<string>;
    name: string;
    onUpdated: Observable<any>;
    metaPropertyObject: RxAVObject;
    saveProperties(): Observable<boolean>;
}

export class RXAVIMProperties implements IRXAVIMProperties {
    constructor() {
        this.metaPropertyObject = new RxAVObject(RXAVIMProperties._rxAVIMPropertiesClassName);
    }
    saveProperties(): Observable<boolean> {
        return this.metaPropertyObject.save();
    }
    public static _rxAVIMPropertiesClassName = 'Conversation_Properties';
    _onUpdated: Observable<any>;

    get admins() {
        return this.metaPropertyObject.get('admins');
    }
    set admins(value: string[]) {
        this.metaPropertyObject.set('admins', value);
    }
    metaPropertyObject: RxAVObject;

    get bulletins() {
        return this.metaPropertyObject.get('bulletins');
    }
    set bulletins(value: any[]) {
        this.metaPropertyObject.set('bulletins', value);
    }

    get owner() {
        return this.metaPropertyObject.get('owner');
    }
    set owner(value: string) {
        this.metaPropertyObject.set('owner', value);
    }

    get topics() {
        return this.metaPropertyObject.get('topics');
    }
    set topics(value: any[]) {
        this.metaPropertyObject.set('topics', value);
    }
    get name() {
        return this.metaPropertyObject.get('name');
    }
    set name(value: string) {
        this.metaPropertyObject.set('name', value);
    }


    get onUpdated() {
        if (this.metaPropertyObject.objectId == undefined) {
            throw new Error('can not subscribe a live query before RXAVIMProperties.save() called or the meata objectId is undefined.')
        }
        if (this._onUpdated == undefined) {
            let query = new RxAVQuery(RXAVIMProperties._rxAVIMPropertiesClassName);

            this._onUpdated = query.subscribe().flatMap(lq => {
                return lq.on;
            });
        }
        return this._onUpdated;
    }

    set onUpdated(value: Observable<any>) {
        this._onUpdated = value;
    }
}