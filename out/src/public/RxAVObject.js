"use strict";
var SDKPlugins_1 = require('../internal/SDKPlugins');
var MutableObjectState_1 = require('../internal/object/state/MutableObjectState');
var RxLeanCloud_1 = require('../RxLeanCloud');
var rxjs_1 = require('rxjs');
/**
 * 代表的一个 free-schema 的对象
 *
 * @export
 * @class RxAVObject
 */
var RxAVObject = (function () {
    /**
     * RxAVObject 类，代表一个结构化存储的对象.
     * @constructor
     * @param {string} className - className:对象在云端数据库对应的表名.
     */
    function RxAVObject(className) {
        this.estimatedData = {};
        this._isDirty = true;
        this.state = new MutableObjectState_1.MutableObjectState({ className: className });
        this.className = className;
    }
    Object.defineProperty(RxAVObject, "_objectController", {
        get: function () {
            return SDKPlugins_1.SDKPlugins.instance.ObjectControllerInstance;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(RxAVObject.prototype, "className", {
        get: function () {
            return this.state.className;
        },
        set: function (className) {
            this.state.className = className;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(RxAVObject.prototype, "objectId", {
        get: function () {
            return this.state.objectId;
        },
        set: function (id) {
            this._isDirty = true;
            this.state.objectId = id;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(RxAVObject.prototype, "isDirty", {
        get: function () {
            return this._isDirty;
        },
        set: function (v) {
            this._isDirty = v;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(RxAVObject.prototype, "createdAt", {
        get: function () {
            return this.state.createdAt;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(RxAVObject.prototype, "updatedAt", {
        get: function () {
            return this.state.updatedAt;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(RxAVObject.prototype, "ACL", {
        get: function () {
            return this._acl;
        },
        set: function (acl) {
            this._acl = acl;
            this.set('ACL', this._acl);
        },
        enumerable: true,
        configurable: true
    });
    RxAVObject.prototype.set = function (key, value) {
        this.isDirty = true;
        this.estimatedData[key] = value;
    };
    RxAVObject.prototype.get = function (key) {
        return this.estimatedData[key];
    };
    /**
     * 将当前对象保存到云端.
     * 如果对象的 objectId 为空云端会根据现有的数据结构新建一个对象并返回一个新的 objectId.
     * @returns {Observable<boolean>}
     *
     * @memberOf RxAVObject
     */
    RxAVObject.prototype.save = function () {
        var _this = this;
        var rtn = rxjs_1.Observable.from([true]);
        if (!this.isDirty)
            return rtn;
        RxAVObject.recursionCollectDirtyChildren(this, [], [], []);
        var dirtyChildren = this.collectAllLeafNodes();
        if (dirtyChildren.length > 0) {
            rtn = RxAVObject.batchSave(dirtyChildren).flatMap(function (sal) { return _this.save(); });
        }
        else {
            rtn = RxAVObject._objectController.save(this.state, this.estimatedData, RxLeanCloud_1.RxAVUser.currentSessionToken).map(function (serverState) {
                _this.handlerSave(serverState);
                return true;
            });
        }
        return rtn;
    };
    RxAVObject.prototype.fetch = function () {
        var _this = this;
        if (this.objectId == null)
            throw new Error("Cannot refresh an object that hasn't been saved to the server.");
        return RxAVObject._objectController.fetch(this.state, RxLeanCloud_1.RxAVUser.currentSessionToken).map(function (serverState) {
            _this.handleFetchResult(serverState);
            return _this;
        });
    };
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
    RxAVObject.createWithoutData = function (classnName, objectId) {
        var rtn = new RxAVObject(classnName);
        rtn.objectId = objectId;
        return rtn;
    };
    /**
     * 批量保存 RxAVObject
     *
     * @static
     * @param {Array<RxAVObject>} objects 需要批量保存的 RxAVObject 数组
     *
     * @memberOf RxAVObject
     */
    RxAVObject.saveAll = function (objects) {
        var r;
        objects.map(function (obj) {
            var y = obj.save();
            r = rxjs_1.Observable.concat(y);
        });
        return r;
    };
    RxAVObject.batchSave = function (objArray) {
        var states = objArray.map(function (c) { return c.state; });
        var ds = objArray.map(function (c) { return c.estimatedData; });
        return RxAVObject._objectController.batchSave(states, ds, RxLeanCloud_1.RxAVUser.currentSessionToken).map(function (serverStateArray) {
            objArray.forEach(function (dc, i, a) {
                dc.isDirty = false;
                dc.handlerSave(serverStateArray[i]);
            });
            return true;
        });
    };
    RxAVObject.deepSave = function (obj) {
        var dirtyChildren = [];
        for (var key in obj.estimatedData) {
            var value = obj.estimatedData[key];
            if (value instanceof RxAVObject) {
                if (value.isDirty) {
                    dirtyChildren.push(value);
                }
            }
        }
        if (dirtyChildren.length == 0)
            return rxjs_1.Observable.from([true]);
        return RxAVObject.saveAll(dirtyChildren);
    };
    RxAVObject.prototype.collectDirtyChildren = function () {
        var dirtyChildren = [];
        for (var key in this.estimatedData) {
            var value = this.estimatedData[key];
            if (value instanceof RxAVObject) {
                if (value.isDirty) {
                    dirtyChildren.push(value);
                }
            }
        }
        return dirtyChildren;
    };
    RxAVObject.prototype.collectAllLeafNodes = function () {
        var leafNodes = [];
        var dirtyChildren = this.collectDirtyChildren();
        if (dirtyChildren.length == 0) {
            if (this.isDirty)
                leafNodes.push(this);
        }
        else {
            dirtyChildren.map(function (child) {
                leafNodes = leafNodes.concat(child.collectAllLeafNodes());
            });
        }
        return leafNodes;
    };
    RxAVObject.recursionCollectDirtyChildren = function (root, warehouse, seen, seenNew) {
        var dirtyChildren = root.collectDirtyChildren();
        dirtyChildren.map(function (child) {
            var scopedSeenNew = [];
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
    };
    RxAVObject.prototype.handlerSave = function (serverState) {
        this.state.apply(serverState);
        this.isDirty = false;
        //this.rebuildEstimatedData();
    };
    RxAVObject.prototype.handleFetchResult = function (serverState) {
        this.state.apply(serverState);
        this.rebuildEstimatedData();
        this._isNew = false;
        this.isDirty = false;
    };
    RxAVObject.prototype.mergeFromServer = function (serverState) {
        if (serverState.objectId != null) {
        }
    };
    RxAVObject.prototype.rebuildEstimatedData = function () {
        this.estimatedData = {};
        this.estimatedData = this.state.serverData;
    };
    RxAVObject.prototype.setProperty = function (propertyName, value) {
        if (this.state != null) {
            this.state.serverData[propertyName] = value;
        }
    };
    RxAVObject.prototype.getProperty = function (propertyName) {
        if (this.state != null) {
            if (this.state.containsKey(propertyName))
                return this.state.serverData[propertyName];
        }
        return null;
    };
    RxAVObject.prototype.buildRelation = function (op, opEntities) {
        if (opEntities) {
            var action = op == 'add' ? 'AddRelation' : 'RemoveRelation';
            var body = {};
            var encodedEntities = SDKPlugins_1.SDKPlugins.instance.Encoder.encodeItem(opEntities);
            body = {
                __op: action,
                'objects': encodedEntities
            };
            return body;
        }
    };
    return RxAVObject;
}());
exports.RxAVObject = RxAVObject;
