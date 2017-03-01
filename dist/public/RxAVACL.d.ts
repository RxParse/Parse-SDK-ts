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
    /**
     * Returns a JSON-encoded version of the ACL.
     * @method toJSON
     * @return {Object}
     */
    toJSON(): ByIdMap;
    /**
     * Returns whether this ACL is equal to another object
     * @method equals
     * @param other The other object to compare to
     * @return {Boolean}
     */
    equals(other: RxAVACL): boolean;
    private _setAccess(accessType, userId, allowed);
    private _getAccess(accessType, userId);
    findWriteAccess(): boolean;
    /**
     * Sets whether the given user is allowed to read this object.
     * @method setReadAccess
     * @param userId An instance of User or its objectId.
     * @param {Boolean} allowed Whether that user should have read access.
     */
    setReadAccess(userId: RxAVUser | RxAVRole | string, allowed: boolean): void;
    /**
     * Get whether the given user id is *explicitly* allowed to read this object.
     * Even if this returns false, the user may still be able to access it if
     * getPublicReadAccess returns true or a role that the user belongs to has
     * write access.
     * @method getReadAccess
     * @param userId An instance of User or its objectId, or a Role.
     * @return {Boolean}
     */
    getReadAccess(userId: RxAVUser | RxAVRole | string): boolean;
    /**
     * Sets whether the given user id is allowed to write this object.
     * @method setWriteAccess
     * @param userId An instance of User or its objectId, or a Role..
     * @param {Boolean} allowed Whether that user should have write access.
     */
    setWriteAccess(userId: RxAVUser | RxAVRole | string, allowed: boolean): void;
    /**
     * Gets whether the given user id is *explicitly* allowed to write this object.
     * Even if this returns false, the user may still be able to write it if
     * getPublicWriteAccess returns true or a role that the user belongs to has
     * write access.
     * @method getWriteAccess
     * @param userId An instance of User or its objectId, or a Role.
     * @return {Boolean}
     */
    getWriteAccess(userId: RxAVUser | RxAVRole | string): boolean;
    /**
     * Sets whether the public is allowed to read this object.
     * @method setPublicReadAccess
     * @param {Boolean} allowed
     */
    setPublicReadAccess(allowed: boolean): void;
    /**
     * Gets whether the public is allowed to read this object.
     * @method getPublicReadAccess
     * @return {Boolean}
     */
    getPublicReadAccess(): boolean;
    /**
     * Sets whether the public is allowed to write this object.
     * @method setPublicWriteAccess
     * @param {Boolean} allowed
     */
    setPublicWriteAccess(allowed: boolean): void;
    /**
     * Gets whether the public is allowed to write this object.
     * @method getPublicWriteAccess
     * @return {Boolean}
     */
    getPublicWriteAccess(): boolean;
    /**
     * Gets whether users belonging to the given role are allowed
     * to read this object. Even if this returns false, the role may
     * still be able to write it if a parent role has read access.
     *
     * @method getRoleReadAccess
     * @param role The name of the role, or a Role object.
     * @return {Boolean} true if the role has read access. false otherwise.
     * @throws {TypeError} If role is neither a Role nor a String.
     */
    getRoleReadAccess(role: RxAVRole | string): boolean;
    /**
     * Gets whether users belonging to the given role are allowed
     * to write this object. Even if this returns false, the role may
     * still be able to write it if a parent role has write access.
     *
     * @method getRoleWriteAccess
     * @param role The name of the role, or a Role object.
     * @return {Boolean} true if the role has write access. false otherwise.
     * @throws {TypeError} If role is neither a Role nor a String.
     */
    getRoleWriteAccess(role: RxAVRole | string): boolean;
    /**
     * Sets whether users belonging to the given role are allowed
     * to read this object.
     *
     * @method setRoleReadAccess
     * @param role The name of the role, or a Role object.
     * @param {Boolean} allowed Whether the given role can read this object.
     * @throws {TypeError} If role is neither a Role nor a String.
     */
    setRoleReadAccess(role: RxAVRole | string, allowed: boolean): void;
    /**
     * Sets whether users belonging to the given role are allowed
     * to write this object.
     *
     * @method setRoleWriteAccess
     * @param role The name of the role, or a Role object.
     * @param {Boolean} allowed Whether the given role can write this object.
     * @throws {TypeError} If role is neither a Role nor a String.
     */
    setRoleWriteAccess(role: RxAVRole | string, allowed: boolean): void;
}
