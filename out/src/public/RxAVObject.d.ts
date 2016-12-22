import { IObjectState } from '../internal/object/state/IObjectState';
import { IObjectController } from '../internal/object/controller/iObjectController';
import { MutableObjectState } from '../internal/object/state/MutableObjectState';
import { RxAVACL } from '../RxLeanCloud';
import { Observable } from 'rxjs';
/**
 * 代表的一个 free-schema 的对象
 *
 * @export
 * @class RxAVObject
 */
export declare class RxAVObject {
    estimatedData: {
        [key: string]: any;
    };
    state: MutableObjectState;
    private _isDirty;
    private _isNew;
    private _acl;
    /**
     * RxAVObject 类，代表一个结构化存储的对象.
     * @constructor
     * @param {string} className - className:对象在云端数据库对应的表名.
     */
    constructor(className: string);
    protected static readonly _objectController: IObjectController;
    className: string;
    objectId: string;
    isDirty: boolean;
    readonly createdAt: Date;
    readonly updatedAt: Date;
    ACL: RxAVACL;
    set(key: string, value: any): void;
    get(key: string): any;
    /**
     * 将当前对象保存到云端.
     * 如果对象的 objectId 为空云端会根据现有的数据结构新建一个对象并返回一个新的 objectId.
     * @returns {Observable<boolean>}
     *
     * @memberOf RxAVObject
     */
    save(): Observable<boolean>;
    fetch(): Observable<RxAVObject>;
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
    static createWithoutData(classnName: string, objectId: string): RxAVObject;
    /**
     * 批量保存 RxAVObject
     *
     * @static
     * @param {Array<RxAVObject>} objects 需要批量保存的 RxAVObject 数组
     *
     * @memberOf RxAVObject
     */
    static saveAll(objects: Array<RxAVObject>): Observable<boolean>;
    protected static batchSave(): void;
    protected static deepSave(obj: RxAVObject): Observable<boolean>;
    protected collectDirtyChildren(): RxAVObject[];
    protected handlerSave(serverState: IObjectState): void;
    handleFetchResult(serverState: IObjectState): void;
    protected mergeFromServer(serverState: IObjectState): void;
    protected rebuildEstimatedData(): void;
    protected setProperty(propertyName: string, value: any): void;
    protected getProperty(propertyName: string): any;
    protected buildRelation(op: string, opEntities: Array<RxAVObject>): {
        [key: string]: any;
    };
}
