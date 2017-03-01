"use strict";
var RxAVUser_1 = require('./RxAVUser');
var RxAVRole_1 = require('./RxAVRole');
var PUBLIC_KEY = '*';
/**
 *
 * 基于角色的权限管理
 * @export
 * @class RxAVACL
 */
var RxAVACL = (function () {
    /**
     * Creates an instance of RxAVACL.
     * @param {...any[]} arg
     *
     * @memberOf RxAVACL
     */
    function RxAVACL() {
        var _this = this;
        var arg = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            arg[_i - 0] = arguments[_i];
        }
        this.permissionsById = {};
        if (arg.length > 0) {
            arg.forEach(function (currentItem) {
                if (currentItem instanceof RxAVUser_1.RxAVUser) {
                    _this.setReadAccess(currentItem, true);
                    _this.setWriteAccess(currentItem, true);
                }
                else if (currentItem instanceof RxAVRole_1.RxAVRole) {
                    _this.setReadAccess(currentItem, true);
                    _this.setWriteAccess(currentItem, true);
                }
                else if (typeof currentItem === 'string') {
                    _this.setRoleWriteAccess(currentItem, true);
                    _this.setRoleReadAccess(currentItem, true);
                }
                else if (currentItem !== undefined) {
                    throw new TypeError('RxAVACL.constructor need RxAVUser or RxAVRole.');
                }
            });
        }
        else {
            if (RxAVUser_1.RxAVUser.currentUser) {
                this.setReadAccess(RxAVUser_1.RxAVUser.currentUser, true);
                this.setWriteAccess(RxAVUser_1.RxAVUser.currentUser, true);
            }
            else {
                this.setPublicReadAccess(true);
                this.setPublicWriteAccess(true);
            }
        }
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
    RxAVACL.prototype.toJSON = function () {
        var permissions = {};
        for (var p in this.permissionsById) {
            permissions[p] = this.permissionsById[p];
        }
        return permissions;
    };
    /**
     * Returns whether this ACL is equal to another object
     * @method equals
     * @param other The other object to compare to
     * @return {Boolean}
     */
    RxAVACL.prototype.equals = function (other) {
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
    };
    RxAVACL.prototype._setAccess = function (accessType, userId, allowed) {
        if (userId instanceof RxAVUser_1.RxAVUser) {
            userId = userId.objectId;
        }
        else if (userId instanceof RxAVRole_1.RxAVRole) {
            var name_1 = userId.name;
            if (!name_1) {
                throw new TypeError('Role must have a name');
            }
            userId = 'role:' + name_1;
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
            }
            else {
                permissions = {};
                this.permissionsById[userId] = permissions;
            }
        }
        if (allowed) {
            this.permissionsById[userId][accessType] = true;
        }
        else {
            delete permissions[accessType];
            if (Object.keys(permissions).length === 0) {
                delete this.permissionsById[userId];
            }
        }
    };
    RxAVACL.prototype._getAccess = function (accessType, userId) {
        if (userId instanceof RxAVUser_1.RxAVUser) {
            userId = userId.objectId;
            if (!userId) {
                throw new Error('Cannot get access for a RxAVUser without an ID');
            }
        }
        else if (userId instanceof RxAVRole_1.RxAVRole) {
            var name_2 = userId.name;
            if (!name_2) {
                throw new TypeError('Role must have a name');
            }
            userId = 'role:' + name_2;
        }
        var permissions = this.permissionsById[userId];
        if (!permissions) {
            return false;
        }
        return !!permissions[accessType];
    };
    RxAVACL.prototype.findWriteAccess = function () {
        var rtn = false;
        for (var key in this.permissionsById) {
            var permisstion = this.permissionsById[key];
            if (permisstion['write']) {
                rtn = true;
                break;
            }
        }
        return rtn;
    };
    /**
     * Sets whether the given user is allowed to read this object.
     * @method setReadAccess
     * @param userId An instance of User or its objectId.
     * @param {Boolean} allowed Whether that user should have read access.
     */
    RxAVACL.prototype.setReadAccess = function (userId, allowed) {
        this._setAccess('read', userId, allowed);
    };
    /**
     * Get whether the given user id is *explicitly* allowed to read this object.
     * Even if this returns false, the user may still be able to access it if
     * getPublicReadAccess returns true or a role that the user belongs to has
     * write access.
     * @method getReadAccess
     * @param userId An instance of User or its objectId, or a Role.
     * @return {Boolean}
     */
    RxAVACL.prototype.getReadAccess = function (userId) {
        return this._getAccess('read', userId);
    };
    /**
     * Sets whether the given user id is allowed to write this object.
     * @method setWriteAccess
     * @param userId An instance of User or its objectId, or a Role..
     * @param {Boolean} allowed Whether that user should have write access.
     */
    RxAVACL.prototype.setWriteAccess = function (userId, allowed) {
        this._setAccess('write', userId, allowed);
    };
    /**
     * Gets whether the given user id is *explicitly* allowed to write this object.
     * Even if this returns false, the user may still be able to write it if
     * getPublicWriteAccess returns true or a role that the user belongs to has
     * write access.
     * @method getWriteAccess
     * @param userId An instance of User or its objectId, or a Role.
     * @return {Boolean}
     */
    RxAVACL.prototype.getWriteAccess = function (userId) {
        return this._getAccess('write', userId);
    };
    /**
     * Sets whether the public is allowed to read this object.
     * @method setPublicReadAccess
     * @param {Boolean} allowed
     */
    RxAVACL.prototype.setPublicReadAccess = function (allowed) {
        this.setReadAccess(PUBLIC_KEY, allowed);
    };
    /**
     * Gets whether the public is allowed to read this object.
     * @method getPublicReadAccess
     * @return {Boolean}
     */
    RxAVACL.prototype.getPublicReadAccess = function () {
        return this.getReadAccess(PUBLIC_KEY);
    };
    /**
     * Sets whether the public is allowed to write this object.
     * @method setPublicWriteAccess
     * @param {Boolean} allowed
     */
    RxAVACL.prototype.setPublicWriteAccess = function (allowed) {
        this.setWriteAccess(PUBLIC_KEY, allowed);
    };
    /**
     * Gets whether the public is allowed to write this object.
     * @method getPublicWriteAccess
     * @return {Boolean}
     */
    RxAVACL.prototype.getPublicWriteAccess = function () {
        return this.getWriteAccess(PUBLIC_KEY);
    };
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
    RxAVACL.prototype.getRoleReadAccess = function (role) {
        if (role instanceof RxAVRole_1.RxAVRole) {
            // Normalize to the String name
            role = role.name;
        }
        if (typeof role !== 'string') {
            throw new TypeError('role must be a RxAVRole or a String');
        }
        return this.getReadAccess('role:' + role);
    };
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
    RxAVACL.prototype.getRoleWriteAccess = function (role) {
        if (role instanceof RxAVRole_1.RxAVRole) {
            // Normalize to the String name
            role = role.name;
        }
        if (typeof role !== 'string') {
            throw new TypeError('role must be a RxAVRole or a String');
        }
        return this.getWriteAccess('role:' + role);
    };
    /**
     * Sets whether users belonging to the given role are allowed
     * to read this object.
     *
     * @method setRoleReadAccess
     * @param role The name of the role, or a Role object.
     * @param {Boolean} allowed Whether the given role can read this object.
     * @throws {TypeError} If role is neither a Role nor a String.
     */
    RxAVACL.prototype.setRoleReadAccess = function (role, allowed) {
        if (role instanceof RxAVRole_1.RxAVRole) {
            // Normalize to the String name
            role = role.name;
        }
        if (typeof role !== 'string') {
            throw new TypeError('role must be a RxAVRole or a String');
        }
        this.setReadAccess('role:' + role, allowed);
    };
    /**
     * Sets whether users belonging to the given role are allowed
     * to write this object.
     *
     * @method setRoleWriteAccess
     * @param role The name of the role, or a Role object.
     * @param {Boolean} allowed Whether the given role can write this object.
     * @throws {TypeError} If role is neither a Role nor a String.
     */
    RxAVACL.prototype.setRoleWriteAccess = function (role, allowed) {
        if (role instanceof RxAVRole_1.RxAVRole) {
            // Normalize to the String name
            role = role.name;
        }
        if (typeof role !== 'string') {
            throw new TypeError('role must be a RxAVRole or a String');
        }
        this.setWriteAccess('role:' + role, allowed);
    };
    return RxAVACL;
}());
exports.RxAVACL = RxAVACL;
