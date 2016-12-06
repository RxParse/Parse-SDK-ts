"use strict";
var SDKPlugins_1 = require('../internal/SDKPlugins');
var MutableObjectState_1 = require('../internal/object/state/MutableObjectState');
var RxLeanCloud_1 = require('../RxLeanCloud');
var rxjs_1 = require('@reactivex/rxjs');
var RxAVObject = (function () {
    /**
     * RxAVObject 类，代表一个结构化存储的对象.
     * @constructor
     * @param {string} className - className:对象在云端数据库对应的表名.
     */
    function RxAVObject(className) {
        this.className = className;
        this.estimatedData = {};
        this._isDirty = true;
        this.state = new MutableObjectState_1.MutableObjectState({ className: className });
    }
    Object.defineProperty(RxAVObject, "ObjectController", {
        get: function () {
            return SDKPlugins_1.SDKPlugins.instance.ObjectControllerInstance;
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
    RxAVObject.prototype.set = function (key, value) {
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
        var dirtyChildren = this.collectDirtyChildren();
        if (dirtyChildren.length == 0) {
            var y = RxAVObject.ObjectController.save(this.state, this.estimatedData, RxLeanCloud_1.RxAVUser.currentSessionToken).map(function (serverState) {
                console.log('this.handlerSave(serverState);');
                _this.handlerSave(serverState);
                return true;
            });
            return y;
        }
        else {
            var states = dirtyChildren.map(function (c) { return c.state; });
            var ds = dirtyChildren.map(function (c) { return c.estimatedData; });
            var x = RxAVObject.ObjectController.batchSave(states, ds, RxLeanCloud_1.RxAVUser.currentSessionToken).map(function (serverStateArray) {
                dirtyChildren.forEach(function (dc, i, a) {
                    dc.isDirty = false;
                    dc.handlerSave(serverStateArray[i]);
                });
                return dirtyChildren;
            }).flatMap(function (sss, i) {
                return RxAVObject.ObjectController.save(_this.state, _this.estimatedData, RxLeanCloud_1.RxAVUser.currentSessionToken).map(function (serverState) {
                    console.log('father');
                    _this.handlerSave(serverState);
                    return true;
                });
            });
            return x;
        }
        // let y = RxAVObject.ObjectController.save(this.state, this.estimatedData, RxAVUser.currentSessionToken).map(serverState => {
        //     console.log('this.handlerSave(serverState);');
        //     this.handlerSave(serverState);
        //     return true;
        // });
        // return Observable.concat(x, y);
        // return RxAVObject.deepSave(this).map(success => {
        //     return RxAVObject.ObjectController.save(this.state, this.estimatedData, RxAVUser.currentSessionToken).map(serverState => {
        //         console.log('this.handlerSave(serverState);');
        //         this.handlerSave(serverState);
        //     });
        // });
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
        // let dictionaries = objects.map(obj => obj.estimatedData);
        // let states = objects.map(obj => obj.state);
        // return RxAVObject.ObjectController.saveAll(states, dictionaries, RxAVUser.currentSessionToken).map(next => {
        // });
    };
    RxAVObject.batchSave = function () {
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
        console.log('dirtyChildren.length', dirtyChildren.length);
        if (dirtyChildren.length == 0)
            return rxjs_1.Observable.from([true]);
        return RxAVObject.saveAll(dirtyChildren);
        // return RxAVObject.saveAll(dirtyChildren).do(children => { 
        //      return obj.save();
        // });
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
    RxAVObject.prototype.handlerSave = function (serverState) {
        this.state.apply(serverState);
    };
    RxAVObject.prototype.handleFetchResult = function (serverState) {
        this.state.apply(serverState);
    };
    RxAVObject.prototype.mergeFromServer = function (serverState) {
        if (serverState.objectId != null) {
        }
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
    return RxAVObject;
}());
exports.RxAVObject = RxAVObject;
