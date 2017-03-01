import { RxAVUser } from './RxAVUser';
import { RxAVRole } from './RxAVRole';
export declare type PermissionsMap = {
    [permission: string]: boolean;
};
export declare type ByIdMap = {
    [userId: string]: PermissionsMap;
};
/**
 *
 * 基于角色的权限管理
 * @export
 * @class RxAVACL
 */
export declare class RxAVACL {
    private permissionsById;
    /**
     * Creates an instance of RxAVACL.
     * @param {...any[]} arg
     *
     * @memberOf RxAVACL
     */
    constructor(...arg: any[]);
    toJSON(): ByIdMap;
    /**
     * 判断两个 ACL 对象是否相等
     *
     * @param {RxAVACL} other
     * @returns {boolean}
     *
     * @memberOf RxAVACL
     */
    equals(other: RxAVACL): boolean;
    private _setAccess(accessType, userId, allowed);
    private _getAccess(accessType, userId);
    /**
     * 查找 Write 权限
     *
     * @returns {boolean}
     *
     * @memberOf RxAVACL
     */
    findWriteAccess(): boolean;
    /**
     * 设置 Read 权限
     *
     * @param {any} userId {(RxAVUser | RxAVRole | string)}
     * @param {boolean} allowed
     *
     * @memberOf RxAVACL
     */
    setReadAccess(userId: RxAVUser | RxAVRole | string, allowed: boolean): void;
    /**
     * 获取 Read 权限
     *
     * @param {any}  userId {(RxAVUser | RxAVRole | string)}
     * @returns {boolean}
     *
     * @memberOf RxAVACL
     */
    getReadAccess(userId: RxAVUser | RxAVRole | string): boolean;
    /**
     * 设置 Write 权限
     *
     * @param {any} userId {(RxAVUser | RxAVRole | string)}
     * @param {boolean} allowed
     *
     * @memberOf RxAVACL
     */
    setWriteAccess(userId: RxAVUser | RxAVRole | string, allowed: boolean): void;
    /**
     * 获取 Write 权限
     *
     * @param {any} userId {(RxAVUser | RxAVRole | string)} userId
     * @returns {boolean}
     *
     * @memberOf RxAVACL
     */
    getWriteAccess(userId: RxAVUser | RxAVRole | string): boolean;
    /**
     * 设置所有人的 Read 权限
     *
     * @param {boolean} allowed
     *
     * @memberOf RxAVACL
     */
    setPublicReadAccess(allowed: boolean): void;
    /**
     *  获取所有人的 Read 权限
     *
     * @returns {boolean}
     *
     * @memberOf RxAVACL
     */
    getPublicReadAccess(): boolean;
    /**
     * 设置所有人的 Write 权限
     *
     * @param {boolean} allowed
     *
     * @memberOf RxAVACL
     */
    setPublicWriteAccess(allowed: boolean): void;
    /**
     * 获取所有人的 Write 权限
     *
     * @returns {boolean}
     *
     * @memberOf RxAVACL
     */
    getPublicWriteAccess(): boolean;
    /**
     * 设置角色的 Read 权限
     *
     * @param {any} role {(RxAVRole | string)}
     * @returns {boolean}
     *
     * @memberOf RxAVACL
     */
    getRoleReadAccess(role: RxAVRole | string): boolean;
    /**
     *  获取角色的 Write 权限
     *
     * @param {any} role {(RxAVRole | string)}
     * @returns {boolean}
     *
     * @memberOf RxAVACL
     */
    getRoleWriteAccess(role: RxAVRole | string): boolean;
    /**
     * 设置角色的 Read 权限
     *
     * @param {any} role {(RxAVRole | string)}
     * @param {boolean} allowed
     *
     * @memberOf RxAVACL
     */
    setRoleReadAccess(role: RxAVRole | string, allowed: boolean): void;
    /**
     * 设置角色 Write 权限
     *
     * @param {any} role {(RxAVRole | string)}
     * @param {boolean} allowed
     *
     * @memberOf RxAVACL
     */
    setRoleWriteAccess(role: RxAVRole | string, allowed: boolean): void;
}
