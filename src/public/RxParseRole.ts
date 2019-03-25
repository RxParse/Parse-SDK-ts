import { RxParseObject } from './RxParseObject';
import { RxParseACL } from './RxParseACL';
import { RxParseUser } from './RxParseUser';
import { RxParseQuery } from './RxParseQuery';
import { flatMap, map, filter } from 'rxjs/operators';
import { Observable, from } from 'rxjs';

export class RxParseRole extends RxParseObject {

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


    grant(...args: any[]): Observable<boolean> {
        return this._postRelation('add', ...args);
    }

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
                throw new TypeError('args type must be RxParseRole or RxParseUser.');
            }
        });
        this._buildRoleRelation(op, users, roles, body);
        return RxParseUser.currentSessionToken().pipe(flatMap(sessionToken => {
            return RxParseUser._objectController.save(this.state, this.currentOperations, sessionToken).pipe(map(serverState => {
                return serverState != null;
            }));
        }));
    }

    public save() {
        this._buildRoleRelation('add', this.users, this.roles, this.estimatedData);
        if (!this.ACL) throw new Error('Role must have a ACL.');

        if (this.ACL.getPublicWriteAccess()) {
            throw new Error('can NOT set Role.ACL public write access in true.');
        }

        if (!(this.ACL.findWriteAccess())) {
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

    public static createWithoutData(objectId?: string) {
        let rtn = new RxParseRole();
        if (objectId)
            rtn.objectId = objectId;
        return rtn;
    }

    public static createWithName(name: string, objectId: string) {
        let rtn = new RxParseRole();
        rtn.name = name;
        rtn.objectId = objectId;
        return rtn;
    }

    public static getByName(roleName: string) {
        let query = new RxParseQuery('_Role');
        query.equalTo('name', roleName);
        return query.find().pipe(map(roleList => {
            if (roleList.length > 0) {
                let obj = roleList[0];
                let roleId = obj.objectId;
                let roleName = obj.get('name');
                let role = RxParseRole.createWithName(roleName, roleId);
                return role;
            }
            return undefined;
        }));
    }

}