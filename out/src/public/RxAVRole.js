"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var RxLeanCloud_1 = require('../RxLeanCloud');
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
     * 将当前 Role 的权限授予给 args 里面包含的 Role 和 User
     *
     * @param {...any[]} args Array<RxAVRole> or Array<RxAVUser>
     * @returns {Observable<boolean>}
     *
     * @memberOf RxAVRole
     */
    RxAVRole.prototype.grant = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i - 0] = arguments[_i];
        }
        return this._postRelation.apply(this, ['add'].concat(args));
    };
    /**
     * 取消当前用户对 args 包含的 Role 和 User 的关联，args 包含的 Role 和 User 将不再具备当前 Role 的权限
     *
     * @param {...any[]} args Array<RxAVRole> or Array<RxAVUser>
     * @returns {Observable<boolean>}
     *
     * @memberOf RxAVRole
     */
    RxAVRole.prototype.deny = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i - 0] = arguments[_i];
        }
        return this._postRelation.apply(this, ['remove'].concat(args));
    };
    RxAVRole.prototype._postRelation = function (op) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        var body = {};
        var users = [];
        var roles = [];
        args.forEach(function (currentItem) {
            if (currentItem instanceof RxLeanCloud_1.RxAVUser) {
                users.push(currentItem);
            }
            else if (currentItem instanceof RxAVRole) {
                roles.push(currentItem);
            }
            else {
                throw new TypeError('args type must be RxAVRole or RxAVUser.');
            }
        });
        this._buildRoleRelation(op, users, roles, body);
        return RxLeanCloud_1.RxAVUser._objectController.save(this.state, body, RxLeanCloud_1.RxAVUser.currentSessionToken).map(function (serverState) {
            return serverState != null;
        });
    };
    RxAVRole.prototype.save = function () {
        this._buildRoleRelation('add', this.users, this.roles, this.estimatedData);
        if (!this.ACL)
            throw new Error('Role must have a ACL.');
        if (this.ACL.getPublicWriteAccess()) {
            throw new Error('can NOT set Role.ACL public write access in true.');
        }
        if (!(this.ACL.findWriteAccess() && RxLeanCloud_1.RxAVClient.inLeanEngine)) {
            throw new Error('can NOT set Role.ACL write access in closed.');
        }
        return _super.prototype.save.call(this);
    };
    RxAVRole.prototype._buildRoleRelation = function (op, users, roles, postBody) {
        if (users && users.length > 0) {
            var usersBody = this.buildRelation(op, users);
            postBody['users'] = usersBody;
        }
        if (roles && roles.length > 0) {
            var rolesBody = this.buildRelation(op, roles);
            postBody['roles'] = rolesBody;
        }
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
    /**
     * 根据名字以及 objectId 构建 Role
     *
     * @static
     * @param {string} name
     * @param {string} objectId
     * @returns
     *
     * @memberOf RxAVRole
     */
    RxAVRole.createWithName = function (name, objectId) {
        var rtn = new RxAVRole();
        rtn.name = name;
        rtn.objectId = objectId;
        return rtn;
    };
    return RxAVRole;
}(RxLeanCloud_1.RxAVObject));
exports.RxAVRole = RxAVRole;
