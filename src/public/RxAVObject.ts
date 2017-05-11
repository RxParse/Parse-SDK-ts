import { SDKPlugins } from '../internal/SDKPlugins';
import { IObjectState } from '../internal/object/state/IObjectState';
import { IObjectController } from '../internal/object/controller/iObjectController';
import { IStorageController } from '../internal/storage/controller/IStorageController';
import { MutableObjectState } from '../internal/object/state/MutableObjectState';
import { RxAVUser, RxAVACL, RxAVClient, RxAVQuery, RxAVApp } from '../RxLeanCloud';
import { Observable } from 'rxjs';

/**
 * 代表的一个 free-schema 的对象
 * 
 * @export
 * @class RxAVObject
 */
export class RxAVObject {

    estimatedData: { [key: string]: any };
    state: MutableObjectState;
    private _isDirty: boolean;
    private _isNew: boolean;
    private _acl: RxAVACL;

    /**
     * RxAVObject 类，代表一个结构化存储的对象.
     * @constructor
     * @param {string} className - className:对象在云端数据库对应的表名.
     */
    constructor(className: string, options?: any) {

        this.estimatedData = {};
        this._isDirty = true;

        let app = RxAVClient.instance.currentApp;
        if (options) {
            if (options.app) {
                if (options.app instanceof RxAVApp) {
                    app = options.app;
                }
            }
        }
        this.state = new MutableObjectState({ className: className, app: app });
        this.className = className;
    }

    protected static get _objectController() {
        return SDKPlugins.instance.ObjectControllerInstance;
    }

    /**
     *  获取当前对象的 className
     * 
     * 
     * @memberOf RxAVObject
     */
    get className() {
        return this.state.className;
    }

    /**
     *  设置当前对象的 className
     * 
     * 
     * @memberOf RxAVObject
     */
    set className(className: string) {
        this.state.className = className;
    }

    /**
     * 获取当前对象的 objectId
     * 
     * 
     * @memberOf RxAVObject
     */
    get objectId() {
        return this.state.objectId;
    }

    /**
     * 设置当前对象的 objectId
     * 
     * 
     * @memberOf RxAVObject
     */
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

    get ACL() {
        return this._acl;
    }
    set ACL(acl: RxAVACL) {
        this._acl = acl;
        this.set('ACL', this._acl);
    }

    set(key: string, value: any) {
        this.isDirty = true;
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
        let rtn: Observable<boolean> = Observable.from([true]);
        if (!this.isDirty) return rtn;
        RxAVObject.recursionCollectDirtyChildren(this, [], [], []);

        let dirtyChildren = this.collectAllLeafNodes();

        if (dirtyChildren.length > 0) {
            rtn = RxAVObject.batchSave(dirtyChildren).flatMap<boolean, boolean>(sal => this.save());
        } else {
            rtn = RxAVObject._objectController.save(this.state, this.estimatedData, RxAVUser.currentSessionToken).map(serverState => {
                this.handlerSave(serverState);
                return true;
            });
        }
        return rtn;
    }

    /**
     * 从服务端获取数据覆盖本地的数据
     * 
     * @returns {Observable<RxAVObject>}
     * 
     * @memberOf RxAVObject
     */
    public fetch(): Observable<RxAVObject> {
        if (this.objectId == null) throw new Error(`Cannot refresh an object that hasn't been saved to the server.`);
        return RxAVObject._objectController.fetch(this.state, RxAVUser.currentSessionToken).map(serverState => {
            this.handleFetchResult(serverState);
            return this;
        });
    }

    /**
     * 删除指定属性上的值
     * 
     * @param {string} key 
     * 
     * @memberOf RxAVObject
     */
    public remove(key: string) {
        this.performOperation(key, 'remove');
    }

    /**
     * 根据 className 和 objectId 构建一个对象
     * 
     * @static
     * @param {string} classnName 表名称
     * @param {string} objectId objectId
     * @returns {RxAVObject}
     * 
     * @memberOf RxAVObject
     */
    public static createWithoutData(classnName: string, objectId: string) {
        let rtn = new RxAVObject(classnName);
        rtn.objectId = objectId;
        return rtn;
    }

    /**
     * 根据子类类型以及 objectId 创建子类实例
     * 
     * @static
     * @template T
     * @param {T}
     * @param {string} objectId
     * @returns {T}
     * 
     * @memberOf RxAVObject
     */
    public static createSubclass<T extends RxAVObject>(
        ctor: { new (): T; }, objectId: string): T {
        let rtn = new ctor();
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

    protected static batchSave(objArray: Array<RxAVObject>) {
        let states = objArray.map(c => c.state);
        let ds = objArray.map(c => c.estimatedData);
        return RxAVObject._objectController.batchSave(states, ds, RxAVUser.currentSessionToken).map(serverStateArray => {
            objArray.forEach((dc, i, a) => {
                dc.handlerSave(serverStateArray[i]);
            });
            return true;
        });
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

    collectAllLeafNodes() {
        let leafNodes: Array<RxAVObject> = [];
        let dirtyChildren = this.collectDirtyChildren();

        dirtyChildren.map(child => {
            let childLeafNodes = child.collectAllLeafNodes();
            if (childLeafNodes.length == 0) {
                if (child.isDirty) {
                    leafNodes.push(child);
                }
            } else {
                leafNodes = leafNodes.concat(childLeafNodes);
            }
        });

        return leafNodes;
    }

    static recursionCollectDirtyChildren(root: RxAVObject, warehouse: Array<RxAVObject>, seen: Array<RxAVObject>, seenNew: Array<RxAVObject>) {

        let dirtyChildren = root.collectDirtyChildren();
        dirtyChildren.map(child => {
            let scopedSeenNew: Array<RxAVObject> = [];
            if (seenNew.indexOf(child) > -1) {
                throw new Error('Found a circular dependency while saving');
            }
            scopedSeenNew = scopedSeenNew.concat(seenNew);
            scopedSeenNew.push(child);

            if (seen.indexOf(child) > -1) {
                return;
            }
            seen.push(child);
            RxAVObject.recursionCollectDirtyChildren(child, warehouse, seen, scopedSeenNew);
            warehouse.push(child);
        });
    }

    handlerSave(serverState: IObjectState) {
        this.state.apply(serverState);
        this.isDirty = false;
        //this.rebuildEstimatedData();
    }

    handleFetchResult(serverState: IObjectState) {
        this.state.apply(serverState);
        this.rebuildEstimatedData();
        this._isNew = false;
        this.isDirty = false;
    }

    protected mergeFromServer(serverState: IObjectState) {
        if (serverState.objectId != null) {

        }
    }

    protected rebuildEstimatedData() {
        this.estimatedData = {};
        this.estimatedData = this.state.serverData;
    }

    protected setProperty(propertyName: string, value: any) {
        if (this.state && this.state != null) {
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

    performOperation(key: string, operation: string) {
        if (operation == 'remove') {
            this.set(key, { __op: 'Delete' });
        }
    }

    protected buildRelation(op: string, opEntities: Array<RxAVObject>) {
        if (opEntities) {
            let action = op == 'add' ? 'AddRelation' : 'RemoveRelation';
            let body: { [key: string]: any } = {};
            let encodedEntities = SDKPlugins.instance.Encoder.encodeItem(opEntities);
            body = {
                __op: action,
                'objects': encodedEntities
            };
            return body;
        }
    }

    /**
     * 查询 Relation 包含的对象数组
     * 
     * @param {string} key
     * @param {any} targetClassName
     * @returns {Observable<RxAVObject[]>}
     * 
     * @memberOf RxAVObject
     */
    public fetchRelation(key: string, targetClassName): Observable<RxAVObject[]> {
        let query = new RxAVQuery(targetClassName);
        query.relatedTo(this, key);
        return query.find();
    }

    protected static saveToLocalStorage(entity: RxAVObject, key: string) {
        if (SDKPlugins.instance.hasStorage) {
            if (entity == null) {
                return SDKPlugins.instance.LocalStorageControllerInstance.remove(key).map(provider => {
                    return provider != null;
                });
            } else {
                return SDKPlugins.instance.LocalStorageControllerInstance.set(key, entity.toJSONObjectForSaving()).map(provider => {
                    return provider != null;
                });
            }
        }
        return Observable.from([true]);
    }

    protected toJSONObjectForSaving() {
        let data = this.estimatedData;
        data['objectId'] = this.objectId;
        data['createdAt'] = this.createdAt;
        data['updatedAt'] = this.updatedAt;
        let encoded = SDKPlugins.instance.Encoder.encode(data);
        return encoded;
    }
}