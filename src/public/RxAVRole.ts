import { SDKPlugins } from '../internal/SDKPlugins';
import { RxAVClient, RxAVObject, RxAVACL, RxAVUser } from '../RxLeanCloud';
import { IObjectState } from '../internal/object/state/IObjectState';
import { MutableObjectState } from '../internal/object/state/MutableObjectState';
import { IUserController } from '../internal/user/controller/iUserController';
import { Observable } from 'rxjs';

/**
 * 角色
 * 
 * @export
 * @class RxAVRole 一个角色对应的是 _Role 表里的一个对象
 * @extends {RxAVObject}
 */
export /**
 * RxAVRole
 */
    class RxAVRole extends RxAVObject {
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
    constructor(name?: string, acl?: RxAVACL, users?: Array<RxAVUser>, roles?: Array<RxAVRole>) {
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
            if (RxAVUser.currentUser) {
                this.ACL = new RxAVACL(RxAVUser.currentUser);
            } else {
                //throw new Error('Object must have a valid ACL.');
                //this.ACL = new RxAVACL(this.name);
            }
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

    protected users: Array<RxAVUser>;
    protected roles: Array<RxAVRole>;

    /**
     * 为用户赋予角色
     * 
     * @param {...any[]} args Array<RxAVUser.objectId> or Array<RxAVUser>
     * @returns {Observable<boolean>}
     * 
     * @memberOf RxAVRole
     */
    assign(...args: any[]): Observable<boolean> {
        return this._setRelation('users', 'add', '_User', ...args);
    }

    /**
     * 剥夺用户的角色
     * 
     * @param {...any[]} args Array<RxAVUser.objectId> or Array<RxAVUser>
     * @returns {Observable<boolean>}
     * 
     * @memberOf RxAVRole
     */
    deprive(...args: any[]): Observable<boolean> {
        return this._setRelation('users', 'remove', '_User', ...args);
    }

    /**
     * 将当前 Role 的权限授予给 args 里面包含的 Role
     * 
     * @param {...any[]} args Array<RxAVRole.objectId> or Array<RxAVRole>
     * @returns {Observable<boolean>}
     * 
     * @memberOf RxAVRole
     */
    grant(...args: any[]): Observable<boolean> {
        return this._setRelation('roles', 'add', '_Role', ...args);
    }

    /**
     * 取消当前用户对 args 包含的 Role 的关联，args 包含的 Role 将不再具备当前 Role 的权限
     * 
     * @param {...any[]} args
     * @returns {Observable<boolean>}
     * 
     * @memberOf RxAVRole
     */
    deny(...args: any[]): Observable<boolean> {
        return this._setRelation('roles', 'remove', '_Role', ...args);
    }

    public save() {
        this._buildRoleRelation();
        if (!this.ACL) throw new Error('Role muse have a ACL.');
        // if (this.ACL.getPublicReadAccess() && this.ACL.getPublicWriteAccess())
        //     throw new Error('can NOT set Role.ACL public read and write access both in true.');
        return super.save();
    }

    protected _buildRoleRelation() {
        if (this.users) {
            let usersBody: { [key: string]: any } = this.buildRelation('add', this.users);
            this.estimatedData['users'] = usersBody;
        }
        if (this.roles) {
            let rolesBody: { [key: string]: any } = this.buildRelation('add', this.users);
            this.estimatedData['roles'] = rolesBody;
        }
    }

    protected _setRelation(field: string, op: string, className: string, ...args: any[]) {
        
        if (args == null || args.length < 1 || typeof this.objectId === undefined) return Observable.from([false]);

        let toOpEntities: Array<RxAVObject> = [];
        args.forEach(currentItem => {
            if (currentItem instanceof RxAVObject) {
                toOpEntities.push(currentItem);
            } else if (typeof currentItem == 'string') {
                let restoredObject = RxAVObject.createWithoutData(className, currentItem);
                toOpEntities.push(restoredObject);
            } else {
                throw new TypeError('args type must be string or RxAVUser.');
            }
        });

        let body: { [key: string]: any } = {};
        body[field] = this.buildRelation(op, toOpEntities);

        return RxAVUser._objectController.save(this.state, body, RxAVUser.currentSessionToken).map(serverState => {
            return serverState != null;
        });
    }

    /**
     * 根据 objectId 构建 Role
     * 
     * @static
     * @param {string} [objectId]
     * @returns
     * 
     * @memberOf RxAVRole
     */
    public static createWithoutData(objectId?: string) {
        let rtn = new RxAVRole();
        if (objectId)
            rtn.objectId = objectId;
        return rtn;
    }

    public static createWithName(name: string, objectId: string) {
        let rtn = new RxAVRole();
        rtn.name = name;
        rtn.objectId = objectId;
        return rtn;
    }
}