"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var RxLeanCloud_1 = require('../RxLeanCloud');
var rxjs_1 = require('rxjs');
/**
 * 角色
 *
 * @export
 * @class RxAVRole 一个角色对应的是 _Role 表里的一个对象
 * @extends {RxAVObject}
 */
var RxAVRole = (function (_super) {
    __extends(RxAVRole, _super);
    /**
     * Creates an instance of RxAVRole.
     *
     * @param {string} [name] 角色名称
     * @param {Array<RxAVUser>} [users] 拥有当前角色的用户
     * @param {Array<RxAVRole>} [roles] 继承当前角色的角色
     * @param {RxAVACL} [acl] 当前 RxAVRole 的 ACL，这里规定了谁能对当前 RxAVRole 进行后续的操作
     *
     * @memberOf RxAVRole
     */
    function RxAVRole(name, acl, users, roles) {
        _super.call(this, '_Role');
        var idChecker = function (element, index, array) {
            return element.objectId != null;
        };
        if (users) {
            if (users.every(idChecker))
                this.users = users;
            else
                throw new Error('some users in args(users) has no objectId.');
        }
        if (roles) {
            if (roles.every(idChecker))
                this.roles = roles;
            else
                throw new Error('some roles in args(roles) has no objectId.');
        }
        if (name)
            this.name = name;
        if (acl) {
            this.ACL = acl;
        }
        else {
            if (RxLeanCloud_1.RxAVUser.currentUser) {
                this.ACL = new RxLeanCloud_1.RxAVACL(RxLeanCloud_1.RxAVUser.currentUser);
            }
            else {
            }
        }
    }
    Object.defineProperty(RxAVRole.prototype, "name", {
        get: function () {
            if (!this._name) {
                this._name = this.get('name');
            }
            return this._name;
        },
        set: function (name) {
            this._name = name;
            this.set('name', name);
        },
        enumerable: true,
        configurable: true
    });
    /**
     * 为用户赋予角色
     *
     * @param {...any[]} args Array<RxAVUser.objectId> or Array<RxAVUser>
     * @returns {Observable<boolean>}
     *
     * @memberOf RxAVRole
     */
    RxAVRole.prototype.assign = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i - 0] = arguments[_i];
        }
        return this._setRelation.apply(this, ['users', 'add', '_User'].concat(args));
    };
    /**
     * 剥夺用户的角色
     *
     * @param {...any[]} args Array<RxAVUser.objectId> or Array<RxAVUser>
     * @returns {Observable<boolean>}
     *
     * @memberOf RxAVRole
     */
    RxAVRole.prototype.deprive = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i - 0] = arguments[_i];
        }
        return this._setRelation.apply(this, ['users', 'remove', '_User'].concat(args));
    };
    /**
     * 将当前 Role 的权限授予给 args 里面包含的 Role
     *
     * @param {...any[]} args Array<RxAVRole.objectId> or Array<RxAVRole>
     * @returns {Observable<boolean>}
     *
     * @memberOf RxAVRole
     */
    RxAVRole.prototype.grant = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i - 0] = arguments[_i];
        }
        return this._setRelation.apply(this, ['roles', 'add', '_Role'].concat(args));
    };
    /**
     * 取消当前用户对 args 包含的 Role 的关联，args 包含的 Role 将不再具备当前 Role 的权限
     *
     * @param {...any[]} args
     * @returns {Observable<boolean>}
     *
     * @memberOf RxAVRole
     */
    RxAVRole.prototype.deny = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i - 0] = arguments[_i];
        }
        return this._setRelation.apply(this, ['roles', 'remove', '_Role'].concat(args));
    };
    RxAVRole.prototype.save = function () {
        this._buildRoleRelation();
        if (!this.ACL)
            throw new Error('Role muse have a ACL.');
        // if (this.ACL.getPublicReadAccess() && this.ACL.getPublicWriteAccess())
        //     throw new Error('can NOT set Role.ACL public read and write access both in true.');
        return _super.prototype.save.call(this);
    };
    RxAVRole.prototype._buildRoleRelation = function () {
        if (this.users) {
            var usersBody = this.buildRelation('add', this.users);
            this.estimatedData['users'] = usersBody;
        }
        if (this.roles) {
            var rolesBody = this.buildRelation('add', this.users);
            this.estimatedData['roles'] = rolesBody;
        }
    };
    RxAVRole.prototype._setRelation = function (field, op, className) {
        var args = [];
        for (var _i = 3; _i < arguments.length; _i++) {
            args[_i - 3] = arguments[_i];
        }
        if (args == null || args.length < 1 || typeof this.objectId === undefined)
            return rxjs_1.Observable.from([false]);
        var toOpEntities = [];
        args.forEach(function (currentItem) {
            if (currentItem instanceof RxLeanCloud_1.RxAVObject) {
                toOpEntities.push(currentItem);
            }
            else if (typeof currentItem == 'string') {
                var restoredObject = RxLeanCloud_1.RxAVObject.createWithoutData(className, currentItem);
                toOpEntities.push(restoredObject);
            }
            else {
                throw new TypeError('args type must be string or RxAVUser.');
            }
        });
        var body = {};
        body[field] = this.buildRelation(op, toOpEntities);
        return RxLeanCloud_1.RxAVUser._objectController.save(this.state, body, RxLeanCloud_1.RxAVUser.currentSessionToken).map(function (serverState) {
            return serverState != null;
        });
    };
    /**
     * 根据 objectId 构建 Role
     *
     * @static
     * @param {string} [objectId]
     * @returns
     *
     * @memberOf RxAVRole
     */
    RxAVRole.createWithoutData = function (objectId) {
        var rtn = new RxAVRole();
        if (objectId)
            rtn.objectId = objectId;
        return rtn;
    };
    RxAVRole.createWithName = function (name, objectId) {
        var rtn = new RxAVRole();
        rtn.name = name;
        rtn.objectId = objectId;
        return rtn;
    };
    return RxAVRole;
}(RxLeanCloud_1.RxAVObject));
exports.RxAVRole = RxAVRole;
