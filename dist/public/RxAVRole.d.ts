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
     * 为用户赋予角色
     *
     * @param {...any[]} args Array<RxAVUser.objectId> or Array<RxAVUser>
     * @returns {Observable<boolean>}
     *
     * @memberOf RxAVRole
     */
    assign(...args: any[]): Observable<boolean>;
    /**
     * 剥夺用户的角色
     *
     * @param {...any[]} args Array<RxAVUser.objectId> or Array<RxAVUser>
     * @returns {Observable<boolean>}
     *
     * @memberOf RxAVRole
     */
    deprive(...args: any[]): Observable<boolean>;
    /**
     * 将当前 Role 的权限授予给 args 里面包含的 Role
     *
     * @param {...any[]} args Array<RxAVRole.objectId> or Array<RxAVRole>
     * @returns {Observable<boolean>}
     *
     * @memberOf RxAVRole
     */
    grant(...args: any[]): Observable<boolean>;
    /**
     * 取消当前用户对 args 包含的 Role 的关联，args 包含的 Role 将不再具备当前 Role 的权限
     *
     * @param {...any[]} args
     * @returns {Observable<boolean>}
     *
     * @memberOf RxAVRole
     */
    deny(...args: any[]): Observable<boolean>;
    save(): Observable<boolean>;
    protected _buildRoleRelation(): void;
    protected _setRelation(field: string, op: string, className: string, ...args: any[]): Observable<boolean>;
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
    static createWithName(name: string, objectId: string): RxAVRole;
}
