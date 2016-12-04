import { IObjectState } from '../internal/object/state/IObjectState';
import { iObjectController } from '../internal/object/controller/iObjectController';
import { MutableObjectState } from '../internal/object/state/MutableObjectState';
import { Observable } from 'rxjs/Observable';
export declare class RxAVObject {
    isNew: boolean;
    className: string;
    estimatedData: {
        [key: string]: any;
    };
    state: MutableObjectState;
    private _isDirty;
    /**
     * RxAVObject 类，代表一个结构化存储的对象.
     * @constructor
     * @param {string} className - className:对象在云端数据库对应的表名.
     */
    constructor(className: string);
    protected readonly ObjectController: iObjectController;
    objectId: string;
    isDirty: boolean;
    readonly createdAt: Date;
    readonly updatedAt: Date;
    set(key: string, value: any): void;
    get(key: string): any;
    /**
     * 将当前对象保存到云端.
     * 如果对象的 objectId 为空云端会根据现有的数据结构新建一个对象并返回一个新的 objectId.
     * @returns {Observable<boolean>}
     *
     * @memberOf RxAVObject
     */
    save(): Observable<void>;
    protected handlerSave(serverState: IObjectState): void;
    protected mergeFromServer(serverState: IObjectState): void;
    protected getProperty(propertyName: string): any;
}
