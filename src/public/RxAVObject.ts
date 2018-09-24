import { SDKPlugins } from '../internal/SDKPlugins';
import { IObjectState } from '../internal/object/state/IObjectState';
import { IAVFieldOperation } from '../internal/operation/IAVFieldOperation';
import { AVAddOperation, AVAddUniqueOperation } from '../internal/operation/AVAddOperation';
import { AVDeleteOperation, AVDeleteToken } from '../internal/operation/AVDeleteOperation';
import { AVRemoveOperation } from '../internal/operation/AVRemoveOperation';
import { IObjectController } from '../internal/object/controller/IObjectController';
import { IStorageController } from '../internal/storage/controller/IStorageController';
import { MutableObjectState } from '../internal/object/state/MutableObjectState';
import { RxParseUser, RxParseACL, RxParseClient, RxParseQuery, ParseApp } from 'RxParse';
import { Observable } from 'rxjs';
import { AVSetOperation } from '../internal/operation/AVSetOperation';

export class StorageObject {
    estimatedData: Map<string, object>;
    currentOperations = new Map<string, IAVFieldOperation>();
    state: MutableObjectState;

    protected _isDirty: boolean;
    public get isDirty() {
        return this._isDirty;
    }

    public set isDirty(v: boolean) {
        this._isDirty = v;
    }

    /**
     *  获取当前对象的 className
     * 
     * 
     * @memberOf RxAVObject
     */
    public get className() {
        return this.state.className;
    }

    /**
     *  设置当前对象的 className
     * 
     * 
     * @memberOf RxAVObject
     */
    public set className(className: string) {
        this.state.className = className;
    }

    constructor(className: string, options?: any) {
        this.state = new MutableObjectState({ className: className });
        this.state.serverData = new Map<string, object>();
        this.state.app = RxParseClient.instance.take(options);

        this.estimatedData = new Map<string, object>();
        this.isDirty = true;
    }

    /**
     * 获取当前对象的 objectId
     * 
     * 
     * @memberOf RxAVObject
     */
    public get objectId() {
        return this.state.objectId;
    }

    /**
     * 设置当前对象的 objectId
     * 
     * 
     * @memberOf RxAVObject
     */
    public set objectId(id: string) {
        this.isDirty = true;
        this.state.objectId = id;
    }

    public set(key: string, value: any) {
        if (value == null || value == undefined) {
            this.remove(key);
        } else {
            let valid = SDKPlugins.instance.Encoder.isValidType(value);
            if (valid) {
                this.performOperation(key, new AVSetOperation(value));
            }
        }
    }

    public get(key: string) {
        return this.estimatedData[key];
    }

    public get createdAt() {
        return this.state.createdAt;
    }

    public get updatedAt() {
        return this.state.updatedAt;
    }

    protected initProperty(propertyName: string, value: any) {
        if (!this.objectId) {
            this.state.serverData[propertyName] = value;
        }
        else {
            throw new Error(`can not reset property '${propertyName}'`);
        }
    }

    /**
     * 删除指定属性上的值
     * 
     * @param {string} key 
     * 
     * @memberOf RxAVObject
     */
    public remove(key: string) {
        this.performOperation(key, AVDeleteOperation.sharedInstance);
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

    protected performOperation(key: string, operation: IAVFieldOperation) {
        let oldValue = this.estimatedData.get(key);
        let newValue = operation.apply(oldValue, key);

        if (newValue instanceof AVDeleteToken) {
            this.estimatedData.delete(key);
        } else {
            this.estimatedData.set(key, newValue);
        }

        let oldOperation = this.currentOperations.get(key);
        let newOperation = operation.mergeWithPrevious(oldOperation);
        this.currentOperations.set(key, newOperation);
        if (this.currentOperations.size > 0) {
            this.isDirty = true;
        }
    }
}

/**
 * 代表的一个 free-schema 的对象
 * 
 * @export
 * @class RxAVObject
 */
export class RxParseObject extends StorageObject implements ICanSaved {

    private _isNew: boolean;
    private _acl: RxParseACL;

    /**
     * RxAVObject 类，代表一个结构化存储的对象.
     * @constructor
     * @param {string} className - className:对象在云端数据库对应的表名.
     */
    constructor(className: string, options?: any) {

        super(className, options);

        this.className = className;
    }

    protected static get _objectController() {
        return SDKPlugins.instance.ObjectControllerInstance;
    }

    get ACL() {
        return this._acl;
    }
    set ACL(acl: RxParseACL) {
        this._acl = acl;
        this.set('ACL', this._acl);
    }

    // addUnique(key: string, value: any) {
    //     this.performOperation(key, 'addUnique', value);
    // }

    // add(key: string, value: any) {
    //     this.addRange(key, [value]);
    // }

    // addRange(key: string, value: Array<any>) {
    //     this
    //     this.performOperation(key, 'addRange', value);
    // }

    // removeRange(key: string, value: Array<any>) {
    //     if (this.currentOperations[key] == undefined) {
    //         this.currentOperations[key] = new Array<AVRemoveOperation>();
    //     }
    //     this.currentOperations[key].push(new AVRemoveOperation(value));
    //     this.performOperation(key, 'removeRange ', value);
    // }

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
        RxParseObject.recursionCollectDirtyChildren(this, [], [], []);

        let dirtyChildren = this.collectAllLeafNodes();

        if (dirtyChildren.length > 0) {
            rtn = RxParseObject.batchSave(dirtyChildren).flatMap<boolean, boolean>(sal => this.save());
        } else {
            return RxParseUser.currentSessionToken().flatMap(sessionToken => {
                return rtn = RxParseObject._objectController.save(this.state, this.currentOperations, sessionToken).map(serverState => {
                    this.handlerSave(serverState);
                    return true;
                });
            });
        }
        return rtn;
    }

    /**
     * 从服务端获取数据覆盖本地的数据
     * 
     * @returns {Observable<RxParseObject>}
     * 
     * @memberOf RxAVObject
     */
    public fetch(): Observable<RxParseObject> {
        if (this.objectId == null) throw new Error(`Cannot refresh an object that hasn't been saved to the server.`);
        return RxParseUser.currentSessionToken().flatMap(sessionToken => {
            return RxParseObject._objectController.fetch(this.state, sessionToken).map(serverState => {
                this.handleFetchResult(serverState);
                return this;
            });
        });
    }

    public delete(): Observable<boolean> {
        if (this.objectId == null) throw new Error(`Cannot delete an object that hasn't been saved to the server.`);
        return RxParseUser.currentSessionToken().flatMap(sessionToken => {
            return RxParseObject._objectController.delete(this.state, sessionToken);
        });
    }

    public static deleteAll(objects: Array<RxParseObject>): Observable<boolean> {
        let r: Observable<boolean>;
        objects.forEach(obj => {
            let d = obj.delete();
            if (r == null || typeof r == 'undefined') {
                r = d;
            } else {
                r = d.concat(r);
            }
        });
        return r;
    }

    /**
     * 删除指定属性上的值
     * 
     * @param {string} key 
     * 
     * @memberOf RxAVObject
     */
    public remove(key: string) {
        this.performOperation(key, AVDeleteOperation.sharedInstance);
    }

    /**
     * 根据 className 和 objectId 构建一个对象
     * 
     * @static
     * @param {string} classnName 表名称
     * @param {string} objectId objectId
     * @returns {RxParseObject}
     * 
     * @memberOf RxAVObject
     */
    public static createWithoutData(classnName: string, objectId: string) {
        let rtn = new RxParseObject(classnName);
        rtn.objectId = objectId;
        rtn.isDirty = false;
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
    public static createSubclass<T extends RxParseObject>(
        ctor: { new(): T; }, objectId: string): T {
        let rtn = new ctor();
        rtn.objectId = objectId;
        rtn.isDirty = false;
        return rtn;
    }

    public static instantiateSubclass(className: string, serverState: IObjectState) {
        if (className == '_User') {
            let user = RxParseObject.createSubclass(RxParseUser, serverState.objectId);
            user.handleFetchResult(serverState);
            return user;
        }
        let rxObject = new RxParseObject(className);
        rxObject.handleFetchResult(serverState);
        return rxObject;
    }

    /**
     * 批量保存 RxAVObject
     * 
     * @static
     * @param {Array<RxParseObject>} objects 需要批量保存的 RxAVObject 数组
     * 
     * @memberOf RxAVObject
     */
    public static saveAll(objects: Array<RxParseObject>) {
        // let r: Observable<boolean>;
        // objects.forEach(obj => {
        //     let y = obj.save();
        //     if (r == null || typeof r == 'undefined') {
        //         r = y;
        //     } else {
        //         r = y.concat(r);
        //     }
        // });
        // return r;
        return this.batchSave(objects);
    }

    protected static batchSave(objArray: Array<RxParseObject>) {
        let states = objArray.map(c => c.state);
        let ds = objArray.map(c => c.currentOperations);
        return RxParseUser.currentSessionToken().flatMap(sessionToken => {
            return RxParseObject._objectController.batchSave(states, ds, sessionToken).map(serverStateArray => {
                objArray.forEach((dc, i, a) => {
                    dc.handlerSave(serverStateArray[i]);
                });
                return true;
            });
        });

    }

    protected static deepSave(obj: RxParseObject) {
        let dirtyChildren: Array<RxParseObject> = [];
        for (let key in obj.estimatedData) {
            let value = obj.estimatedData[key];
            if (value instanceof RxParseObject) {
                if (value.isDirty) {
                    dirtyChildren.push(value);
                }
            }
        }
        if (dirtyChildren.length == 0) return Observable.from([true]);
        return RxParseObject.saveAll(dirtyChildren);
    }

    protected collectDirtyChildren() {
        let dirtyChildren: Array<RxParseObject> = [];

        this.estimatedData.forEach((v, k, m) => {
            if (v instanceof RxParseObject) {
                if (v.isDirty) {
                    dirtyChildren.push(v);
                }
            }
        });
        return dirtyChildren;
    }

    collectAllLeafNodes() {
        let leafNodes: Array<RxParseObject> = [];
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

    static recursionCollectDirtyChildren(root: RxParseObject, warehouse: Array<RxParseObject>, seen: Array<RxParseObject>, seenNew: Array<RxParseObject>) {

        let dirtyChildren = root.collectDirtyChildren();
        dirtyChildren.map(child => {
            let scopedSeenNew: Array<RxParseObject> = [];
            if (seenNew.indexOf(child) > -1) {
                throw new Error('Found a circular dependency while saving');
            }
            scopedSeenNew = scopedSeenNew.concat(seenNew);
            scopedSeenNew.push(child);

            if (seen.indexOf(child) > -1) {
                return;
            }
            seen.push(child);
            RxParseObject.recursionCollectDirtyChildren(child, warehouse, seen, scopedSeenNew);
            warehouse.push(child);
        });
    }

    handlerSave(serverState: IObjectState) {

        this.state.merge(serverState);
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
        this.estimatedData = new Map<string, object>();
        this.estimatedData = this.state.serverData;
    }

    protected buildRelation(op: string, opEntities: Array<RxParseObject>) {
        if (opEntities) {
            let action = op == 'add' ? 'AddRelation' : 'RemoveRelation';
            let body: { [key: string]: any } = {};
            let encodedEntities = SDKPlugins.instance.Encoder.encode(opEntities);
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
     * @returns {Observable<RxParseObject[]>}
     * 
     * @memberOf RxAVObject
     */
    public fetchRelation(key: string, targetClassName): Observable<RxParseObject[]> {
        let query = new RxParseQuery(targetClassName);
        query.relatedTo(this, key);
        return query.find();
    }

    static saveToLocalStorage(entity: ICanSaved, key: string) {
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
        } else {
            return Observable.from([true]);
        }
    }

    toJSONObjectForSaving() {
        let data = this.estimatedData;
        data['objectId'] = this.objectId;
        data['createdAt'] = this.createdAt;
        data['updatedAt'] = this.updatedAt;
        let encoded = SDKPlugins.instance.Encoder.encode(data);
        return encoded;
    }
}

export interface ICanSaved {
    toJSONObjectForSaving(): { [key: string]: any };
}

