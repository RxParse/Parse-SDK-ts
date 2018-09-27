import { SDKPlugins } from '../internal/SDKPlugins';
import { IObjectState } from '../internal/object/state/IObjectState';
import { IParseFieldOperation } from '../internal/operation/IParseFieldOperation';
import { ParseAddOperation, ParseAddUniqueOperation } from '../internal/operation/ParseAddOperation';
import { ParseSetOperation } from '../internal/operation/ParseSetOperation';
import { ParseDeleteOperation, ParseDeleteToken } from '../internal/operation/ParseDeleteOperation';
import { ParseRemoveOperation } from '../internal/operation/ParseRemoveOperation';
import { IObjectController } from '../internal/object/controller/IParseObjectController';
import { IStorageController } from '../internal/storage/controller/IStorageController';
import { MutableObjectState } from '../internal/object/state/MutableObjectState';
import { RxParseUser, RxParseACL, ParseClient, RxParseQuery } from '../RxParse';
import { Observable, from } from 'rxjs';
import { flatMap, map, concat } from 'rxjs/operators';

export class StorageObject {
    estimatedData: Map<string, object>;
    currentOperations = new Map<string, IParseFieldOperation>();
    state: MutableObjectState;

    protected _isDirty: boolean;
    public get isDirty() {
        return this._isDirty;
    }

    public set isDirty(v: boolean) {
        this._isDirty = v;
    }

    public get className() {
        return this.state.className;
    }

    public set className(className: string) {
        this.state.className = className;
    }

    constructor(className: string, options?: any) {
        this.state = new MutableObjectState({ className: className });
        this.state.serverData = new Map<string, object>();
        this.state.app = ParseClient.instance.take(options);

        this.estimatedData = new Map<string, object>();
        this.isDirty = true;
    }

    public get objectId() {
        return this.state.objectId;
    }

    public set objectId(id: string) {
        this.isDirty = true;
        this.state.objectId = id;
    }

    unset(key: string) {
        this.performOperation(key, ParseDeleteOperation.sharedInstance);
    }

    public set(key: string, value: any) {
        if (value == null || value == undefined) {
            this.unset(key);
        } else {
            let valid = SDKPlugins.instance.Encoder.isValidType(value);
            if (valid) {
                this.performOperation(key, new ParseSetOperation(value));
            }
        }
    }

    public get(key: string): any {
        return this.estimatedData.get(key);
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

    protected performOperation(key: string, operation: IParseFieldOperation) {
        let oldValue = this.estimatedData.get(key);
        let newValue = operation.apply(oldValue, key);

        if (newValue instanceof ParseDeleteToken) {
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
 *
 *
 * @export
 * @class RxParseObject
 * @extends {StorageObject}
 * @implements {ICanSaved}
 */
export class RxParseObject extends StorageObject implements ICanSaved {

    private _isNew: boolean;
    private _acl: RxParseACL;

    constructor(className: string, options?: any) {

        super(className, options);

        this.className = className;
    }

    protected static get _objectController(): IObjectController {
        return SDKPlugins.instance.objectController;
    }

    get ACL() {
        return this._acl;
    }

    set ACL(acl: RxParseACL) {
        this._acl = acl;
        this.set('ACL', this._acl);
    }


    add(key: string, value: any) {
        this.addAll(key, [value]);
    }

    addAll(key: string, values: Array<any>) {
        this.performOperation(key, new ParseAddOperation(values));
    }

    addAllUnique(key: string, values: Array<any>) {
        this.performOperation(key, new ParseAddUniqueOperation(values));
    }

    addUnique(key: string, value: any) {
        this.performOperation(key, new ParseAddUniqueOperation([value]));
    }

    removeAll(key: string, value: Array<any>) {
        this.performOperation(key, new ParseRemoveOperation(value));
    }

    remove(key: string, value: any) {
        this.performOperation(key, new ParseRemoveOperation([value]));
    }

    /**
     *
     *
     * @returns
     * @memberof RxParseObject
     */
    public save(): Observable<boolean> {
        let rtn: Observable<boolean> = from([true]);
        if (!this.isDirty) return rtn;
        RxParseObject.recursionCollectDirtyChildren(this, [], [], []);

        let dirtyChildren = this.collectAllLeafNodes();

        if (dirtyChildren.length > 0) {
            rtn = RxParseObject.batchSave(dirtyChildren).pipe(flatMap(sal => this.save()));
        } else {
            return RxParseUser.currentSessionToken().pipe(flatMap(sessionToken => {
                return rtn = RxParseObject._objectController.save(this.state, this.currentOperations, sessionToken).pipe(map(serverState => {
                    this.handlerSave(serverState);
                    return true;
                }));
            }));
        }
        return rtn;
    }

    public fetch(): Observable<RxParseObject> {
        if (this.objectId == null) throw new Error(`Cannot refresh an object that hasn't been saved to the server.`);
        return RxParseUser.currentSessionToken().pipe(flatMap(sessionToken => {
            return RxParseObject._objectController.fetch(this.state, sessionToken).pipe(map(serverState => {
                this.handleFetchResult(serverState);
                return this;
            }));
        }));
    }

    public delete(): Observable<boolean> {
        if (this.objectId == null) throw new Error(`Cannot delete an object that hasn't been saved to the server.`);
        return RxParseUser.currentSessionToken().pipe(flatMap(sessionToken => {
            return RxParseObject._objectController.delete(this.state, sessionToken);
        }));
    }

    public static deleteAll(objects: Array<RxParseObject>): Observable<boolean> {
        let r: Observable<boolean>;
        objects.forEach(obj => {
            let d = obj.delete();
            if (r == null || typeof r == 'undefined') {
                r = d;
            } else {
                r = d.pipe(concat(r));
            }
        });
        return r;
    }

    public static createWithoutData(className: string, objectId: string) {
        let rtn = new RxParseObject(className);
        rtn.objectId = objectId;
        rtn.isDirty = false;
        return rtn;
    }

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

    public static saveAll(objects: Array<RxParseObject>) {
        return this.batchSave(objects);
    }

    protected static batchSave(objArray: Array<RxParseObject>) {
        let states = objArray.map(c => c.state);
        let ds = objArray.map(c => c.currentOperations);
        return RxParseUser.currentSessionToken().pipe(flatMap(sessionToken => {
            return RxParseObject._objectController.batchSave(states, ds, sessionToken).pipe(map(serverStateArray => {
                objArray.forEach((dc, i, a) => {
                    dc.handlerSave(serverStateArray[i]);
                });
                return true;
            }));
        }));

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
        if (dirtyChildren.length == 0) return from([true]);
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

    public fetchRelation(key: string, targetClassName): Observable<RxParseObject[]> {
        let query = new RxParseQuery(targetClassName);
        query.relatedTo(this, key);
        return query.find();
    }

    static saveToLocalStorage(entity: ICanSaved, key: string) {
        if (SDKPlugins.instance.hasStorage) {
            if (entity == null) {
                return SDKPlugins.instance.LocalStorageControllerInstance.remove(key).pipe(map(provider => {
                    return provider != null;
                }));
            } else {
                return SDKPlugins.instance.LocalStorageControllerInstance.set(key, entity.toJSONObjectForSaving()).pipe(map(provider => {
                    return provider != null;
                }));
            }
        } else {
            return from([true]);
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

