import { RxParseUser } from './RxAVUser';
import { RxParseRole } from './RxAVRole';

export type PermissionsMap = { [permission: string]: boolean };
export type ByIdMap = { [userId: string]: PermissionsMap };
var PUBLIC_KEY = '*';

export class RxParseACL {

    private permissionsById: ByIdMap;

    constructor(...arg: any[]) {
        this.permissionsById = {};
        if (arg.length > 0) {
            arg.forEach(currentItem => {
                if (currentItem instanceof RxParseUser) {
                    this.setReadAccess(currentItem, true);
                    this.setWriteAccess(currentItem, true);
                } else if (currentItem instanceof RxParseRole) {
                    this.setReadAccess(currentItem, true);
                    this.setWriteAccess(currentItem, true);
                } else if (typeof currentItem === 'string') {
                    this.setRoleWriteAccess(currentItem, true);
                    this.setRoleReadAccess(currentItem, true);
                } else if (currentItem !== undefined) {
                    throw new TypeError('ParseACL constructor need RxAVUser or RxAVRole.');
                }
            });
        } else {
            this.setPublicReadAccess(true);
            this.setPublicWriteAccess(true);
        }
    }

    toJSON(): ByIdMap {
        let permissions = {};
        for (let p in this.permissionsById) {
            permissions[p] = this.permissionsById[p];
        }
        return permissions;
    }

    equals(other: RxParseACL): boolean {
        if (!(other instanceof RxParseACL)) {
            return false;
        }
        let users = Object.keys(this.permissionsById);
        let otherUsers = Object.keys(other.permissionsById);
        if (users.length !== otherUsers.length) {
            return false;
        }
        for (let u in this.permissionsById) {
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

    private _setAccess(accessType: string, userId: RxParseUser | RxParseRole | string, allowed: boolean) {
        if (userId instanceof RxParseUser) {
            userId = userId.objectId;
        } else if (userId instanceof RxParseRole) {
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
        let permissions = this.permissionsById[userId];
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
        userId: RxParseUser | RxParseRole | string
    ): boolean {
        if (userId instanceof RxParseUser) {
            userId = userId.objectId;
            if (!userId) {
                throw new Error('Cannot get access for a RxAVUser without an ID');
            }
        } else if (userId instanceof RxParseRole) {
            const name = userId.name;
            if (!name) {
                throw new TypeError('Role must have a name');
            }
            userId = 'role:' + name;
        }
        let permissions = this.permissionsById[userId];
        if (!permissions) {
            return false;
        }
        return !!permissions[accessType];
    }

    public findWriteAccess(): boolean {
        let rtn = false;
        for (let key in this.permissionsById) {
            let permission = this.permissionsById[key];
            if (permission['write']) {
                rtn = true;
                break;
            }
        }
        return rtn;
    }

    public setReadAccess(userId: RxParseUser | RxParseRole | string, allowed: boolean) {
        this._setAccess('read', userId, allowed);
    }

    public getReadAccess(userId: RxParseUser | RxParseRole | string): boolean {
        return this._getAccess('read', userId);
    }

    public setWriteAccess(userId: RxParseUser | RxParseRole | string, allowed: boolean) {
        this._setAccess('write', userId, allowed);
    }

    public getWriteAccess(userId: RxParseUser | RxParseRole | string): boolean {
        return this._getAccess('write', userId);
    }

    public setPublicReadAccess(allowed: boolean) {
        this.setReadAccess(PUBLIC_KEY, allowed);
    }

    public getPublicReadAccess(): boolean {
        return this.getReadAccess(PUBLIC_KEY);
    }

    public setPublicWriteAccess(allowed: boolean) {
        this.setWriteAccess(PUBLIC_KEY, allowed);
    }

    public getPublicWriteAccess(): boolean {
        return this.getWriteAccess(PUBLIC_KEY);
    }

    public getRoleReadAccess(role: RxParseRole | string): boolean {
        if (role instanceof RxParseRole) {
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

    public getRoleWriteAccess(role: RxParseRole | string): boolean {
        if (role instanceof RxParseRole) {
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

    public setRoleReadAccess(role: RxParseRole | string, allowed: boolean) {
        if (role instanceof RxParseRole) {
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

    public setRoleWriteAccess(role: RxParseRole | string, allowed: boolean) {
        if (role instanceof RxParseRole) {
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