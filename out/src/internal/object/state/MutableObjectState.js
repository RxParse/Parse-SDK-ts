"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var _hasOwnProperty = Object.prototype.hasOwnProperty;
exports.has = function (obj, prop) {
    return _hasOwnProperty.call(obj, prop);
};
var MutableObjectState = (function () {
    function MutableObjectState(options) {
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
        }
    }
    MutableObjectState.prototype.containsKey = function (key) {
        if (this.serverData == null)
            return false;
        return exports.has(this.serverData, key);
    };
    MutableObjectState.prototype.apply = function (source) {
        this.isNew = source.isNew;
        this.objectId = source.objectId;
        this.createdAt = source.createdAt;
        this.updatedAt = source.updatedAt;
        this.serverData = source.serverData;
    };
    MutableObjectState.prototype.mutatedClone = function (func) {
        var clone = this.mutableClone();
        func(clone);
        return clone;
    };
    MutableObjectState.prototype.mutableClone = function () {
        var state = new MutableObjectState({
            data: this.serverData,
            className: this.className,
            objectId: this.objectId,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt
        });
        return state;
    };
    return MutableObjectState;
}());
exports.MutableObjectState = MutableObjectState;
