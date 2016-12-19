import { RxAVUser } from './RxAVUser';
import { RxAVRole } from './RxAVRole';

export type PermissionsMap = { [permission: string]: boolean };
export type ByIdMap = { [userId: string]: PermissionsMap };
var PUBLIC_KEY = '*';
export /**
 * RxAVACL
 */
    class RxAVACL {

    private permissionsById: ByIdMap;

    constructor() {
        this.permissionsById = {};
        // if (arg1 && typeof arg1 === 'object') {
        //     if (arg1 instanceof RxAVUser) {
        //         this.setReadAccess(arg1, true);
        //         this.setWriteAccess(arg1, true);
        //     } else {
        //         for (var userId in arg1) {
        //             var accessList = arg1[userId];
        //             if (typeof userId !== 'string') {
        //                 throw new TypeError(
        //                     'Tried to create an ACL with an invalid user id.'
        //                 );
        //             }
        //             this.permissionsById[userId] = {};
        //             for (var permission in accessList) {
        //                 var allowed = accessList[permission];
        //                 if (permission !== 'read' && permission !== 'write') {
        //                     throw new TypeError(
        //                         'Tried to create an ACL with an invalid permission type.'
        //                     );
        //                 }
        //                 if (typeof allowed !== 'boolean') {
        //                     throw new TypeError(
        //                         'Tried to create an ACL with an invalid permission value.'
        //                     );
        //                 }
        //                 this.permissionsById[userId][permission] = allowed;
        //             }
        //         }
        //     }
        // } else if (typeof arg1 === 'function') {
        //     throw new TypeError(
        //         'RxAVACL constructed with a function. Did you forget ()?'
        //     );
        // }
    }

    /**
     * Returns a JSON-encoded version of the ACL.
     * @method toJSON
     * @return {Object}
     */
    toJSON(): ByIdMap {
        var permissions = {};
        for (var p in this.permissionsById) {
            permissions[p] = this.permissionsById[p];
        }
        return permissions;
    }

    /**
     * Returns whether this ACL is equal to another object
     * @method equals
     * @param other The other object to compare to
     * @return {Boolean}
     */
    equals(other: RxAVACL): boolean {
        if (!(other instanceof RxAVACL)) {
            return false;
        }
        var users = Object.keys(this.permissionsById);
        var otherUsers = Object.keys(other.permissionsById);
        if (users.length !== otherUsers.length) {
            return false;
        }
        for (var u in this.permissionsById) {
            if (!other.permissionsById[u]) {
                return false;
            }
            if (this.permissionsById[u]['read'] !== other.permissionsById[u]['read']) {
                return false;
            }
            if (this.permissionsById[u]['write'] !== other.permissionsById[u]['write']) {
                return false;
            }
        }
        return true;
    }

    private _setAccess(accessType: string, userId: RxAVUser | RxAVRole | string, allowed: boolean) {
        if (userId instanceof RxAVUser) {
            userId = userId.objectId;
        } else if (userId instanceof RxAVRole) {
            const name = userId.name;
            if (!name) {
                throw new TypeError('Role must have a name');
            }
            userId = 'role:' + name;
        }
        if (typeof userId !== 'string') {
            throw new TypeError('userId must be a string.');
        }
        if (typeof allowed !== 'boolean') {
            throw new TypeError('allowed must be either true or false.');
        }
        var permissions = this.permissionsById[userId];
        if (!permissions) {
            if (!allowed) {
                // The user already doesn't have this permission, so no action is needed
                return;
            } else {
                permissions = {};
                this.permissionsById[userId] = permissions;
            }
        }

        if (allowed) {
            this.permissionsById[userId][accessType] = true;
        } else {
            delete permissions[accessType];
            if (Object.keys(permissions).length === 0) {
                delete this.permissionsById[userId];
            }
        }
    }

    private _getAccess(
        accessType: string,
        userId: RxAVUser | RxAVRole | string
    ): boolean {
        if (userId instanceof RxAVUser) {
            userId = userId.objectId;
            if (!userId) {
                throw new Error('Cannot get access for a RxAVUser without an ID');
            }
        } else if (userId instanceof RxAVRole) {
            const name = userId.name;
            if (!name) {
                throw new TypeError('Role must have a name');
            }
            userId = 'role:' + name;
        }
        var permissions = this.permissionsById[userId];
        if (!permissions) {
            return false;
        }
        return !!permissions[accessType];
    }

    /**
     * Sets whether the given user is allowed to read this object.
     * @method setReadAccess
     * @param userId An instance of User or its objectId.
     * @param {Boolean} allowed Whether that user should have read access.
     */
    setReadAccess(userId: RxAVUser | RxAVRole | string, allowed: boolean) {
        this._setAccess('read', userId, allowed);
    }

    /**
     * Get whether the given user id is *explicitly* allowed to read this object.
     * Even if this returns false, the user may still be able to access it if
     * getPublicReadAccess returns true or a role that the user belongs to has
     * write access.
     * @method getReadAccess
     * @param userId An instance of User or its objectId, or a Role.
     * @return {Boolean}
     */
    getReadAccess(userId: RxAVUser | RxAVRole | string): boolean {
        return this._getAccess('read', userId);
    }

    /**
     * Sets whether the given user id is allowed to write this object.
     * @method setWriteAccess
     * @param userId An instance of User or its objectId, or a Role..
     * @param {Boolean} allowed Whether that user should have write access.
     */
    setWriteAccess(userId: RxAVUser | RxAVRole | string, allowed: boolean) {
        this._setAccess('write', userId, allowed);
    }

    /**
     * Gets whether the given user id is *explicitly* allowed to write this object.
     * Even if this returns false, the user may still be able to write it if
     * getPublicWriteAccess returns true or a role that the user belongs to has
     * write access.
     * @method getWriteAccess
     * @param userId An instance of User or its objectId, or a Role.
     * @return {Boolean}
     */
    getWriteAccess(userId: RxAVUser | RxAVRole | string): boolean {
        return this._getAccess('write', userId);
    }

    /**
     * Sets whether the public is allowed to read this object.
     * @method setPublicReadAccess
     * @param {Boolean} allowed
     */
    setPublicReadAccess(allowed: boolean) {
        this.setReadAccess(PUBLIC_KEY, allowed);
    }

    /**
     * Gets whether the public is allowed to read this object.
     * @method getPublicReadAccess
     * @return {Boolean}
     */
    getPublicReadAccess(): boolean {
        return this.getReadAccess(PUBLIC_KEY);
    }

    /**
     * Sets whether the public is allowed to write this object.
     * @method setPublicWriteAccess
     * @param {Boolean} allowed
     */
    setPublicWriteAccess(allowed: boolean) {
        this.setWriteAccess(PUBLIC_KEY, allowed);
    }

    /**
     * Gets whether the public is allowed to write this object.
     * @method getPublicWriteAccess
     * @return {Boolean}
     */
    getPublicWriteAccess(): boolean {
        return this.getWriteAccess(PUBLIC_KEY);
    }

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
    getRoleReadAccess(role: RxAVRole | string): boolean {
        if (role instanceof RxAVRole) {
            // Normalize to the String name
            role = role.name;
        }
        if (typeof role !== 'string') {
            throw new TypeError(
                'role must be a RxAVRole or a String'
            );
        }
        return this.getReadAccess('role:' + role);
    }

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
    getRoleWriteAccess(role: RxAVRole | string): boolean {
        if (role instanceof RxAVRole) {
            // Normalize to the String name
            role = role.name;
        }
        if (typeof role !== 'string') {
            throw new TypeError(
                'role must be a RxAVRole or a String'
            );
        }
        return this.getWriteAccess('role:' + role);
    }

    /**
     * Sets whether users belonging to the given role are allowed
     * to read this object.
     *
     * @method setRoleReadAccess
     * @param role The name of the role, or a Role object.
     * @param {Boolean} allowed Whether the given role can read this object.
     * @throws {TypeError} If role is neither a Role nor a String.
     */
    setRoleReadAccess(role: RxAVRole | string, allowed: boolean) {
        if (role instanceof RxAVRole) {
            // Normalize to the String name
            role = role.name;
        }
        if (typeof role !== 'string') {
            throw new TypeError(
                'role must be a RxAVRole or a String'
            );
        }
        this.setReadAccess('role:' + role, allowed);
    }

    /**
     * Sets whether users belonging to the given role are allowed
     * to write this object.
     *
     * @method setRoleWriteAccess
     * @param role The name of the role, or a Role object.
     * @param {Boolean} allowed Whether the given role can write this object.
     * @throws {TypeError} If role is neither a Role nor a String.
     */
    setRoleWriteAccess(role: RxAVRole | string, allowed: boolean) {
        if (role instanceof RxAVRole) {
            // Normalize to the String name
            role = role.name;
        }
        if (typeof role !== 'string') {
            throw new TypeError(
                'role must be a RxAVRole or a String'
            );
        }
        this.setWriteAccess('role:' + role, allowed);
    }
}