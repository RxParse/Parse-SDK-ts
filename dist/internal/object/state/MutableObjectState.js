"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _hasOwnProperty = Object.prototype.hasOwnProperty;
exports.has = function (obj, prop) {
    return _hasOwnProperty.call(obj, prop);
};
class MutableObjectState {
    containsKey(key) {
        if (this.serverData == null)
            return false;
        return exports.has(this.serverData, key);
    }
    apply(source) {
        this.isNew = source.isNew;
        this.objectId = source.objectId;
        this.createdAt = source.createdAt;
        this.updatedAt = source.updatedAt;
        this.serverData = source.serverData;
    }
    mutatedClone(func) {
        let clone = this.mutableClone();
        func(clone);
        return clone;
    }
    mutableClone() {
        let state = new MutableObjectState({
            data: this.serverData,
            className: this.className,
            objectId: this.objectId,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt
        });
        return state;
    }
    constructor(options) {
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
exports.MutableObjectState = MutableObjectState;
