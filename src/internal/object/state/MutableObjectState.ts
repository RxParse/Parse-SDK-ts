import { IObjectState } from './IObjectState';
import { ParseApp } from '../../../public/RxAVClient';
import { IAVFieldOperation } from '../../operation/IAVFieldOperation';
import { AVAddOperation } from '../../operation/AVAddOperation';
import { AVDeleteOperation } from '../../operation/AVDeleteOperation';
const _hasOwnProperty = Object.prototype.hasOwnProperty;
export const has = function (obj: any, prop: any) {
    return _hasOwnProperty.call(obj, prop);
};
export /**
 * MutableObjectState
 */
    class MutableObjectState implements IObjectState {
    isNew: boolean;
    className: string;
    objectId: string;
    updatedAt: Date;
    createdAt: Date;
    app: ParseApp;
    serverData: Map<string, object>;
    containsKey(key: string): boolean {
        if (this.serverData == null) return false;
        return has(this.serverData, key);
    }
    apply(source: IObjectState) {
        this.isNew = source.isNew;
        this.objectId = source.objectId;
        this.createdAt = source.createdAt;
        this.updatedAt = source.updatedAt;
        this.serverData = source.serverData;
    }
    merge(source: IObjectState) {
        this.isNew = source.isNew;
        this.updatedAt = source.updatedAt;
        this.objectId = source.objectId;
        this.createdAt = source.createdAt;
    }
    mutatedClone(func: (source: IObjectState) => void): IObjectState {
        let clone = this.mutableClone();
        func(clone);
        return clone;
    }
    protected mutableClone() {
        let state = new MutableObjectState({
            data: this.serverData,
            className: this.className,
            objectId: this.objectId,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt
        });
        return state;
    }

    constructor(options?: any) {
        if (options != null) {
            if (options.className != null) {
                this.className = options.className;
            }
            if (options.data != null) {
                this.serverData = options.data;
            }
            if (options.objectId != null) {
                this.objectId = options.objectId;
            }
            if (options.createdAt != null) {
                this.createdAt = options.createdAt;
            }
            if (options.updatedAt != null) {
                this.updatedAt = options.updatedAt;
            }
            if (options.app != null) {
                this.app = options.app;
            }
        }
    }
}