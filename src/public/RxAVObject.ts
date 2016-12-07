import { SDKPlugins } from '../internal/SDKPlugins';
import { IObjectState } from '../internal/object/state/IObjectState';
import { IObjectController } from '../internal/object/controller/iObjectController';
import { MutableObjectState } from '../internal/object/state/MutableObjectState';
import { RxAVUser } from '../RxLeanCloud';
import { Observable } from '@reactivex/rxjs';

export class RxAVObject {

    className: string;
    estimatedData: { [key: string]: any };
    state: MutableObjectState;
    private _isDirty: boolean;
    private isNew: boolean;

    /**
     * RxAVObject 类，代表一个结构化存储的对象.
     * @constructor
     * @param {string} className - className:对象在云端数据库对应的表名.
     */
    constructor(className: string) {
        this.className = className;
        this.estimatedData = {};
        this._isDirty = true;
        this.state = new MutableObjectState({ className: className });
    }

    protected static get _objectController() {
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
    public save() {
        let dirtyChildren = this.collectDirtyChildren();
        if (dirtyChildren.length == 0) {
            let y = RxAVObject._objectController.save(this.state, this.estimatedData, RxAVUser.currentSessionToken).map(serverState => {
                this.handlerSave(serverState);
                return true;
            });
            return y;
        } else {
            let states = dirtyChildren.map(c => c.state);
            let ds = dirtyChildren.map(c => c.estimatedData);

            let x = RxAVObject._objectController.batchSave(states, ds, RxAVUser.currentSessionToken).map(serverStateArray => {
                dirtyChildren.forEach((dc, i, a) => {
                    dc.isDirty = false;
                    dc.handlerSave(serverStateArray[i]);
                });
                return dirtyChildren;
            }).flatMap((sss, i) => {
                return RxAVObject._objectController.save(this.state, this.estimatedData, RxAVUser.currentSessionToken).map(serverState => {
                    this.handlerSave(serverState);
                    return true;
                });
            });
            return x;
        }
    }

    /**
     * 根据 className 和 objectId 构建一个对象
     * 
     * @static
     * @param {string} classnName 表名称
     * @param {string} objectId objectId
     * @returns
     * 
     * @memberOf RxAVObject
     */
    public static createWithoutData(classnName: string, objectId: string) {
        let rtn = new RxAVObject(classnName);
        rtn.objectId = objectId;
        return rtn;
    }


    /**
     * 批量保存 RxAVObject
     * 
     * @static
     * @param {Array<RxAVObject>} objects 需要批量保存的 RxAVObject 数组
     * 
     * @memberOf RxAVObject
     */
    public static saveAll(objects: Array<RxAVObject>) {
        let r: Observable<boolean>;
        objects.map(obj => {
            let y = obj.save();
            r = Observable.concat(y);
        });
        return r;
    }

    protected static batchSave() {

    }

    protected static deepSave(obj: RxAVObject) {
        let dirtyChildren: Array<RxAVObject> = [];
        for (let key in obj.estimatedData) {
            let value = obj.estimatedData[key];
            if (value instanceof RxAVObject) {
                if (value.isDirty) {
                    dirtyChildren.push(value);
                }
            }
        }
        if (dirtyChildren.length == 0) return Observable.from([true]);
        return RxAVObject.saveAll(dirtyChildren);
    }

    protected collectDirtyChildren() {
        let dirtyChildren: Array<RxAVObject> = [];
        for (let key in this.estimatedData) {
            let value = this.estimatedData[key];
            if (value instanceof RxAVObject) {
                if (value.isDirty) {
                    dirtyChildren.push(value);
                }
            }
        }
        return dirtyChildren;
    }

    protected handlerSave(serverState: IObjectState) {
        this.state.apply(serverState);
    }

    handleFetchResult(serverState: IObjectState) {
        this.state.apply(serverState);
        this.isNew = false;
        this.isDirty = false;
    }

    protected mergeFromServer(serverState: IObjectState) {
        if (serverState.objectId != null) {

        }
    }

    protected setProperty(propertyName: string, value: any) {
        if (this.state != null) {
            this.state.serverData[propertyName] = value;
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