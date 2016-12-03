"use strict";
var SDKPlugins_1 = require('../internal/SDKPlugins');
var MutableObjectState_1 = require('../internal/object/state/MutableObjectState');
var RxLeanCloud_1 = require('../RxLeanCloud');
var RxAVObject = (function () {
    /**
     * RxAVObject 类，代表一个结构化存储的对象.
     * @constructor
     * @param {string} className - className:对象在云端数据库对应的表名.
     */
    function RxAVObject(className) {
        this.className = className;
        this.estimatedData = {};
        this.state = new MutableObjectState_1.MutableObjectState({ className: className });
    }
    Object.defineProperty(RxAVObject.prototype, "ObjectController", {
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
        for (var key in this.estimatedData) {
            var x = this.estimatedData[key];
        }
        return this.ObjectController.save(this.state, this.estimatedData, RxLeanCloud_1.RxAVUser.currentSessionToken).map(function (serverState) {
            _this.handlerSave(serverState);
        });
    };
    RxAVObject.prototype.handlerSave = function (serverState) {
        this.state.apply(serverState);
    };
    RxAVObject.prototype.mergeFromServer = function (serverState) {
        if (serverState.objectId != null) {
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
