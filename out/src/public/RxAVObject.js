"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const SDKPlugins_1 = require("../internal/SDKPlugins");
const MutableObjectState_1 = require("../internal/object/state/MutableObjectState");
const RxLeanCloud_1 = require("../RxLeanCloud");
const rxjs_1 = require("rxjs");
/**
 * 代表的一个 free-schema 的对象
 *
 * @export
 * @class RxAVObject
 */
class RxAVObject {
    /**
     * RxAVObject 类，代表一个结构化存储的对象.
     * @constructor
     * @param {string} className - className:对象在云端数据库对应的表名.
     */
    constructor(className, options) {
        this.estimatedData = {};
        this._isDirty = true;
        this.state = new MutableObjectState_1.MutableObjectState({ className: className });
        this.state.app = RxLeanCloud_1.RxAVClient.instance.take(options);
        this.className = className;
    }
    static get _objectController() {
        return SDKPlugins_1.SDKPlugins.instance.ObjectControllerInstance;
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
    set className(className) {
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
    set objectId(id) {
        this._isDirty = true;
        this.state.objectId = id;
    }
    get isDirty() {
        return this._isDirty;
    }
    set isDirty(v) {
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
    set ACL(acl) {
        this._acl = acl;
        this.set('ACL', this._acl);
    }
    set(key, value) {
        this.isDirty = true;
        this.estimatedData[key] = value;
    }
    get(key) {
        return this.estimatedData[key];
    }
    /**
     * 将当前对象保存到云端.
     * 如果对象的 objectId 为空云端会根据现有的数据结构新建一个对象并返回一个新的 objectId.
     * @returns {Observable<boolean>}
     *
     * @memberOf RxAVObject
     */
    save() {
        let rtn = rxjs_1.Observable.from([true]);
        if (!this.isDirty)
            return rtn;
        RxAVObject.recursionCollectDirtyChildren(this, [], [], []);
        let dirtyChildren = this.collectAllLeafNodes();
        if (dirtyChildren.length > 0) {
            rtn = RxAVObject.batchSave(dirtyChildren).flatMap(sal => this.save());
        }
        else {
            return RxLeanCloud_1.RxAVUser.currentSessionToken().flatMap(sessionToken => {
                return rtn = RxAVObject._objectController.save(this.state, this.estimatedData, sessionToken).map(serverState => {
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
     * @returns {Observable<RxAVObject>}
     *
     * @memberOf RxAVObject
     */
    fetch() {
        if (this.objectId == null)
            throw new Error(`Cannot refresh an object that hasn't been saved to the server.`);
        return RxLeanCloud_1.RxAVUser.currentSessionToken().flatMap(sessionToken => {
            return RxAVObject._objectController.fetch(this.state, sessionToken).map(serverState => {
                this.handleFetchResult(serverState);
                return this;
            });
        });
    }
    /**
     * 删除指定属性上的值
     *
     * @param {string} key
     *
     * @memberOf RxAVObject
     */
    remove(key) {
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
    static createWithoutData(classnName, objectId) {
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
    static createSubclass(ctor, objectId) {
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
    static saveAll(objects) {
        let r;
        objects.map(obj => {
            let y = obj.save();
            r = rxjs_1.Observable.concat(y);
        });
        return r;
    }
    static batchSave(objArray) {
        let states = objArray.map(c => c.state);
        let ds = objArray.map(c => c.estimatedData);
        return RxLeanCloud_1.RxAVUser.currentSessionToken().flatMap(sessionToken => {
            return RxAVObject._objectController.batchSave(states, ds, sessionToken).map(serverStateArray => {
                objArray.forEach((dc, i, a) => {
                    dc.handlerSave(serverStateArray[i]);
                });
                return true;
            });
        });
    }
    static deepSave(obj) {
        let dirtyChildren = [];
        for (let key in obj.estimatedData) {
            let value = obj.estimatedData[key];
            if (value instanceof RxAVObject) {
                if (value.isDirty) {
                    dirtyChildren.push(value);
                }
            }
        }
        if (dirtyChildren.length == 0)
            return rxjs_1.Observable.from([true]);
        return RxAVObject.saveAll(dirtyChildren);
    }
    collectDirtyChildren() {
        let dirtyChildren = [];
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
        let leafNodes = [];
        let dirtyChildren = this.collectDirtyChildren();
        dirtyChildren.map(child => {
            let childLeafNodes = child.collectAllLeafNodes();
            if (childLeafNodes.length == 0) {
                if (child.isDirty) {
                    leafNodes.push(child);
                }
            }
            else {
                leafNodes = leafNodes.concat(childLeafNodes);
            }
        });
        return leafNodes;
    }
    static recursionCollectDirtyChildren(root, warehouse, seen, seenNew) {
        let dirtyChildren = root.collectDirtyChildren();
        dirtyChildren.map(child => {
            let scopedSeenNew = [];
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
    handlerSave(serverState) {
        this.state.apply(serverState);
        this.isDirty = false;
        //this.rebuildEstimatedData();
    }
    handleFetchResult(serverState) {
        this.state.apply(serverState);
        this.rebuildEstimatedData();
        this._isNew = false;
        this.isDirty = false;
    }
    mergeFromServer(serverState) {
        if (serverState.objectId != null) {
        }
    }
    rebuildEstimatedData() {
        this.estimatedData = {};
        this.estimatedData = this.state.serverData;
    }
    setProperty(propertyName, value) {
        if (this.state && this.state != null) {
            this.state.serverData[propertyName] = value;
        }
    }
    getProperty(propertyName) {
        if (this.state != null) {
            if (this.state.containsKey(propertyName))
                return this.state.serverData[propertyName];
        }
        return null;
    }
    performOperation(key, operation) {
        if (operation == 'remove') {
            this.set(key, { __op: 'Delete' });
        }
    }
    buildRelation(op, opEntities) {
        if (opEntities) {
            let action = op == 'add' ? 'AddRelation' : 'RemoveRelation';
            let body = {};
            let encodedEntities = SDKPlugins_1.SDKPlugins.instance.Encoder.encodeItem(opEntities);
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
    fetchRelation(key, targetClassName) {
        let query = new RxLeanCloud_1.RxAVQuery(targetClassName);
        query.relatedTo(this, key);
        return query.find();
    }
    static saveToLocalStorage(entity, key) {
        if (SDKPlugins_1.SDKPlugins.instance.hasStorage) {
            if (entity == null) {
                return SDKPlugins_1.SDKPlugins.instance.LocalStorageControllerInstance.remove(key).map(provider => {
                    return provider != null;
                });
            }
            else {
                return SDKPlugins_1.SDKPlugins.instance.LocalStorageControllerInstance.set(key, entity.toJSONObjectForSaving()).map(provider => {
                    return provider != null;
                });
            }
        }
        return rxjs_1.Observable.from([true]);
    }
    toJSONObjectForSaving() {
        let data = this.estimatedData;
        data['objectId'] = this.objectId;
        data['createdAt'] = this.createdAt;
        data['updatedAt'] = this.updatedAt;
        let encoded = SDKPlugins_1.SDKPlugins.instance.Encoder.encode(data);
        return encoded;
    }
}
exports.RxAVObject = RxAVObject;
