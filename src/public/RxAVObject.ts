import { SDKPlugins } from '../internal/SDKPlugins';
import { IObjectState } from '../internal/object/state/IObjectState';
import { iObjectController } from '../internal/object/controller/iObjectController';
import { MutableObjectState } from '../internal/object/state/MutableObjectState';
import { RxAVUser } from '../RxLeanCloud';
import { Observable } from 'rxjs/Observable';

export class RxAVObject {
    isNew: boolean;
    className: string;
    estimatedData: { [key: string]: any };
    state: MutableObjectState;
    private _isDirty: boolean;

    /**
     * RxAVObject 类，代表一个结构化存储的对象.
     * @constructor
     * @param {string} className - className:对象在云端数据库对应的表名.
     */
    constructor(className: string) {
        this.className = className;
        this.estimatedData = {};
        this.state = new MutableObjectState({ className: className });
    }

    protected get ObjectController() {
        return SDKPlugins.instance.ObjectControllerInstance;
    }

    get objectId() {
        return this.state.objectId;
    }
    set objectId(id: string) {
        this._isDirty = true;
        this.state.objectId = id;
    }
    get isDirty() {
        return this._isDirty;
    }
    set isDirty(v: boolean) {
        this._isDirty = v;
    }

    get createdAt() {
        return this.state.createdAt;
    }

    get updatedAt() {
        return this.state.updatedAt;
    }

    set(key: string, value: any) {
        this.estimatedData[key] = value;
    }

    get(key: string) {
        return this.estimatedData[key];
    }

    /**
     * 将当前对象保存到云端.
     * 如果对象的 objectId 为空云端会根据现有的数据结构新建一个对象并返回一个新的 objectId.
     * @returns {Observable<boolean>}
     * 
     * @memberOf RxAVObject
     */
    save(): Observable<void> {
        for (let key in this.estimatedData) {
            let x = this.estimatedData[key];
        }
        return this.ObjectController.save(this.state, this.estimatedData, RxAVUser.currentSessionToken).map(serverState => {
            this.handlerSave(serverState);
        });
    }

    public static createWithoutData(classnName: string, objectId: string) {
        let rtn = new RxAVObject(classnName);
        rtn.objectId = objectId;
        return rtn;
    }

    protected handlerSave(serverState: IObjectState) {
        this.state.apply(serverState);
    }

    protected handleFetchResult(serverState: IObjectState){
        this.state.apply(serverState);
    }

    protected mergeFromServer(serverState: IObjectState) {
        if (serverState.objectId != null) {

        }
    }

    protected getProperty(propertyName: string) {
        if (this.state != null) {
            if (this.state.containsKey(propertyName))
                return this.state.serverData[propertyName];
        }
        return null;
    }

}