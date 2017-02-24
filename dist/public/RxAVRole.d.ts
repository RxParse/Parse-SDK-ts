import { RxAVObject, RxAVACL, RxAVUser } from '../RxLeanCloud';
import { Observable } from 'rxjs';
/**
 * 角色
 *
 * @export
 * @class RxAVRole 一个角色对应的是 _Role 表里的一个对象
 * @extends {RxAVObject}
 */
export declare class RxAVRole extends RxAVObject {
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
    constructor(name?: string, acl?: RxAVACL, users?: Array<RxAVUser>, roles?: Array<RxAVRole>);
    private _name;
    name: string;
    protected users: Array<RxAVUser>;
    protected roles: Array<RxAVRole>;
    /**
     * 将当前 Role 的权限授予给 args 里面包含的 Role 和 User
     *
     * @param {...any[]} args Array<RxAVRole> or Array<RxAVUser>
     * @returns {Observable<boolean>}
     *
     * @memberOf RxAVRole
     */
    grant(...args: any[]): Observable<boolean>;
    /**
     * 取消当前用户对 args 包含的 Role 和 User 的关联，args 包含的 Role 和 User 将不再具备当前 Role 的权限
     *
     * @param {...any[]} args Array<RxAVRole> or Array<RxAVUser>
     * @returns {Observable<boolean>}
     *
     * @memberOf RxAVRole
     */
    deny(...args: any[]): Observable<boolean>;
    protected _postRelation(op: string, ...args: any[]): Observable<boolean>;
    save(): Observable<boolean>;
    protected _buildRoleRelation(op: string, users: Array<RxAVUser>, roles: Array<RxAVRole>, postBody: {
        [key: string]: any;
    }): void;
    /**
     * 根据 objectId 构建 Role
     *
     * @static
     * @param {string} [objectId]
     * @returns
     *
     * @memberOf RxAVRole
     */
    static createWithoutData(objectId?: string): RxAVRole;
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
    static createWithName(name: string, objectId: string): RxAVRole;
}
