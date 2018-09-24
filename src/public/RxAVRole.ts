import { SDKPlugins } from '../internal/SDKPlugins';
import { RxParseClient, RxParseObject, RxParseACL, RxParseUser, RxParseQuery } from 'RxParse';
import { IObjectState } from '../internal/object/state/IObjectState';
import { MutableObjectState } from '../internal/object/state/MutableObjectState';
import { IUserController } from '../internal/user/controller/IUserController';
import { Observable } from 'rxjs';

/**
 * 角色
 * 
 * @export
 * @class RxAVRole 一个角色对应的是 _Role 表里的一个对象
 * @extends {RxParseObject}
 */
export /**
 * RxAVRole
 */
    class RxParseRole extends RxParseObject {
    /**
     * Creates an instance of RxAVRole.
     * 
     * @param {string} [name] 角色名称
     * @param {Array<RxParseUser>} [users] 拥有当前角色的用户
     * @param {Array<RxParseRole>} [roles] 继承当前角色的角色
     * @param {RxParseACL} [acl] 当前 RxAVRole 的 ACL，这里规定了谁能对当前 RxAVRole 进行后续的操作
     * 
     * @memberOf RxAVRole
     */
    constructor(name?: string, acl?: RxParseACL, users?: Array<RxParseUser>, roles?: Array<RxParseRole>) {
        super('_Role');
        let idChecker = (element, index, array) => {
            return element.objectId != null;
        };
        if (users) {
            if (users.every(idChecker))
                this.users = users;
            else throw new Error('some users in args(users) has no objectId.')
        }

        if (roles) {
            if (roles.every(idChecker))
                this.roles = roles;
            else throw new Error('some roles in args(roles) has no objectId.')
        }
        if (name)
            this.name = name;
        if (acl) {
            this.ACL = acl;
        }
        else {

        }
    }

    private _name: string;
    get name() {
        if (!this._name) {
            this._name = this.get('name');
        }
        return this._name;
    }
    set name(name: string) {
        this._name = name;
        this.set('name', name);
    }

    protected users: Array<RxParseUser>;
    protected roles: Array<RxParseRole>;


    /**
     * 将当前 Role 的权限授予给 args 里面包含的 Role 和 User
     * 
     * @param {...any[]} args Array<RxAVRole> or Array<RxAVUser>
     * @returns {Observable<boolean>}
     * 
     * @memberOf RxAVRole
     */
    grant(...args: any[]): Observable<boolean> {
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
    deny(...args: any[]): Observable<boolean> {
        return this._postRelation('remove', ...args);
    }

    protected _postRelation(op: string, ...args: any[]) {
        let body: { [key: string]: any } = {};
        let users: Array<RxParseUser> = [];
        let roles: Array<RxParseRole> = [];
        args.forEach(currentItem => {
            if (currentItem instanceof RxParseUser) {
                users.push(currentItem);
            } else if (currentItem instanceof RxParseRole) {
                roles.push(currentItem);
            } else {
                throw new TypeError('args type must be RxAVRole or RxAVUser.');
            }
        });
        this._buildRoleRelation(op, users, roles, body);
        return RxParseUser.currentSessionToken().flatMap(sessionToken => {
            return RxParseUser._objectController.save(this.state, this.currentOperations, sessionToken).map(serverState => {
                return serverState != null;
            });
        });
    }

    public save() {
        this._buildRoleRelation('add', this.users, this.roles, this.estimatedData);
        if (!this.ACL) throw new Error('Role must have a ACL.');

        if (this.ACL.getPublicWriteAccess()) {
            throw new Error('can NOT set Role.ACL public write access in true.');
        }

        if (!(this.ACL.findWriteAccess() && RxParseClient.inLeanEngine)) {
            throw new Error('can NOT set Role.ACL write access in closed.');
        }

        return super.save();
    }

    protected _buildRoleRelation(op: string, users: Array<RxParseUser>, roles: Array<RxParseRole>, postBody: { [key: string]: any }) {
        if (users && users.length > 0) {
            let usersBody: { [key: string]: any } = this.buildRelation(op, users);
            postBody['users'] = usersBody;
        }
        if (roles && roles.length > 0) {
            let rolesBody: { [key: string]: any } = this.buildRelation(op, roles);
            postBody['roles'] = rolesBody;
        }
    }

    /**
     * 根据 objectId 构建 Role
     * 
     * @static
     * @param {string} [objectId]
     * @returns {RxParseRole}
     * 
     * @memberOf RxAVRole
     */
    public static createWithoutData(objectId?: string) {
        let rtn = new RxParseRole();
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
     * @returns {RxParseRole}
     * 
     * @memberOf RxAVRole
     */
    public static createWithName(name: string, objectId: string) {
        let rtn = new RxParseRole();
        rtn.name = name;
        rtn.objectId = objectId;
        return rtn;
    }

    public static getByName(roleName: string) {
        let query = new RxParseQuery('_Role');
        query.equalTo('name', roleName);
        return query.find().map(roleList => {
            if (roleList.length > 0) {
                let obj = roleList[0];
                let roleId = obj.objectId;
                let roleName = obj.get('name');
                let role = RxParseRole.createWithName(roleName, roleId);
                return role;
            }
            return undefined;
        });
    }

}