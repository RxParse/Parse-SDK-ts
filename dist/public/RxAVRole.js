"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const RxLeanCloud_1 = require("../RxLeanCloud");
/**
 * 角色
 *
 * @export
 * @class RxAVRole 一个角色对应的是 _Role 表里的一个对象
 * @extends {RxAVObject}
 */
class RxAVRole extends RxLeanCloud_1.RxAVObject {
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
    constructor(name, acl, users, roles) {
        super('_Role');
        let idChecker = (element, index, array) => {
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
        }
    }
    get name() {
        if (!this._name) {
            this._name = this.get('name');
        }
        return this._name;
    }
    set name(name) {
        this._name = name;
        this.set('name', name);
    }
    /**
     * 将当前 Role 的权限授予给 args 里面包含的 Role 和 User
     *
     * @param {...any[]} args Array<RxAVRole> or Array<RxAVUser>
     * @returns {Observable<boolean>}
     *
     * @memberOf RxAVRole
     */
    grant(...args) {
        return this._postRelation('add', ...args);
    }
    /**
     * 取消当前用户对 args 包含的 Role 和 User 的关联，args 包含的 Role 和 User 将不再具备当前 Role 的权限
     *
     * @param {...any[]} args Array<RxAVRole> or Array<RxAVUser>
     * @returns {Observable<boolean>}
     *
     * @memberOf RxAVRole
     */
    deny(...args) {
        return this._postRelation('remove', ...args);
    }
    _postRelation(op, ...args) {
        let body = {};
        let users = [];
        let roles = [];
        args.forEach(currentItem => {
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
        return RxLeanCloud_1.RxAVUser.currentSessionToken().flatMap(sessionToken => {
            return RxLeanCloud_1.RxAVUser._objectController.save(this.state, body, sessionToken).map(serverState => {
                return serverState != null;
            });
        });
    }
    save() {
        this._buildRoleRelation('add', this.users, this.roles, this.estimatedData);
        if (!this.ACL)
            throw new Error('Role must have a ACL.');
        if (this.ACL.getPublicWriteAccess()) {
            throw new Error('can NOT set Role.ACL public write access in true.');
        }
        if (!(this.ACL.findWriteAccess() && RxLeanCloud_1.RxAVClient.inLeanEngine)) {
            throw new Error('can NOT set Role.ACL write access in closed.');
        }
        return super.save();
    }
    _buildRoleRelation(op, users, roles, postBody) {
        if (users && users.length > 0) {
            let usersBody = this.buildRelation(op, users);
            postBody['users'] = usersBody;
        }
        if (roles && roles.length > 0) {
            let rolesBody = this.buildRelation(op, roles);
            postBody['roles'] = rolesBody;
        }
    }
    /**
     * 根据 objectId 构建 Role
     *
     * @static
     * @param {string} [objectId]
     * @returns {RxAVRole}
     *
     * @memberOf RxAVRole
     */
    static createWithoutData(objectId) {
        let rtn = new RxAVRole();
        if (objectId)
            rtn.objectId = objectId;
        return rtn;
    }
    /**
     * 根据名字以及 objectId 构建 Role
     *
     * @static
     * @param {string} name
     * @param {string} objectId
     * @returns {RxAVRole}
     *
     * @memberOf RxAVRole
     */
    static createWithName(name, objectId) {
        let rtn = new RxAVRole();
        rtn.name = name;
        rtn.objectId = objectId;
        return rtn;
    }
}
exports.RxAVRole = RxAVRole;
