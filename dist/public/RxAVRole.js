"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var SDKPlugins_1 = require('../internal/SDKPlugins');
var RxLeanCloud_1 = require('../RxLeanCloud');
var rxjs_1 = require('rxjs');
var RxAVRole = (function (_super) {
    __extends(RxAVRole, _super);
    function RxAVRole(name, acl) {
        _super.call(this, '_Role');
        this.users = [];
        this.roles = [];
        if (name)
            this._name = name;
        if (acl)
            this.ACL = acl;
    }
    Object.defineProperty(RxAVRole.prototype, "name", {
        get: function () {
            return this._name;
        },
        enumerable: true,
        configurable: true
    });
    RxAVRole.prototype.assign = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i - 0] = arguments[_i];
        }
        return this._setRelation('users', 'add', '_User', args);
    };
    RxAVRole.prototype.deprive = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i - 0] = arguments[_i];
        }
        return this._setRelation('users', 'remove', '_User', args);
    };
    RxAVRole.prototype.inherit = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i - 0] = arguments[_i];
        }
        return this._setRelation('roles', 'add', '_Role', args);
    };
    RxAVRole.prototype.disinherit = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i - 0] = arguments[_i];
        }
        return this._setRelation('roles', 'remove', '_Role', args);
    };
    RxAVRole.prototype._setRelation = function (field, op, className) {
        var args = [];
        for (var _i = 3; _i < arguments.length; _i++) {
            args[_i - 3] = arguments[_i];
        }
        if (args == null || args.length < 1)
            return rxjs_1.Observable.from([false]);
        args = args[0];
        var action = op == 'add' ? 'AddRelation' : 'RemoveRelation';
        var toOpEntities = [];
        args.forEach(function (currentItem) {
            if (currentItem instanceof RxLeanCloud_1.RxAVObject) {
                toOpEntities.push(currentItem);
            }
            else if (typeof currentItem == 'string') {
                var restoredObject = RxLeanCloud_1.RxAVObject.createWithoutData(className, currentItem);
                toOpEntities.push(restoredObject);
            }
        });
        var body = {};
        var encodedObjects = SDKPlugins_1.SDKPlugins.instance.Encoder.encodeItem(toOpEntities);
        body[field] = {
            __op: action,
            'objects': encodedObjects
        };
        return RxLeanCloud_1.RxAVUser._objectController.save(this.state, body, RxLeanCloud_1.RxAVUser.currentSessionToken).map(function (serverState) {
            return serverState != null;
        });
    };
    RxAVRole.createWithoutData = function (objectId) {
        var rtn = new RxAVRole();
        if (objectId)
            rtn.objectId = objectId;
        return rtn;
    };
    return RxAVRole;
}(RxLeanCloud_1.RxAVObject));
exports.RxAVRole = RxAVRole;
