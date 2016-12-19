import { SDKPlugins } from '../internal/SDKPlugins';
import { RxAVClient, RxAVObject, RxAVACL, RxAVUser } from '../RxLeanCloud';
import { IObjectState } from '../internal/object/state/IObjectState';
import { MutableObjectState } from '../internal/object/state/MutableObjectState';
import { IUserController } from '../internal/user/controller/iUserController';
import { Observable } from 'rxjs';

export /**
 * RxAVRole
 */
    class RxAVRole extends RxAVObject {
    constructor(name?: string, acl?: RxAVACL) {
        super('_Role');
        this.users = [];
        this.roles = [];
        if (name)
            this._name = name;
        if (acl)
            this.ACL = acl;

    }

    private _name: string;
    get name() {
        return this._name;
    }

    users: Array<RxAVUser>;
    roles: Array<RxAVRole>;

    assign(...args: any[]): Observable<boolean> {
        return this._setRelation('users', 'add', '_User', args);
    }

    deprive(...args: any[]): Observable<boolean> {
        return this._setRelation('users', 'remove', '_User', args);
    }

    inherit(...args: any[]) {
        return this._setRelation('roles', 'add', '_Role', args);
    }

    disinherit(...args: any[]) {
        return this._setRelation('roles', 'remove', '_Role', args);
    }

    protected _setRelation(field: string, op: string, className: string, ...args: any[]) {

        if (args == null || args.length < 1) return Observable.from([false]);
        args = args[0];
        let action = op == 'add' ? 'AddRelation' : 'RemoveRelation';

        let toOpEntities: Array<RxAVObject> = [];
        args.forEach(currentItem => {
            if (currentItem instanceof RxAVObject) {
                toOpEntities.push(currentItem);
            } else if (typeof currentItem == 'string') {
                let restoredObject = RxAVObject.createWithoutData(className, currentItem);
                toOpEntities.push(restoredObject);
            }
        });
        let body: { [key: string]: any } = {};
        let encodedObjects = SDKPlugins.instance.Encoder.encodeItem(toOpEntities);
        body[field] = {
            __op: action,
            'objects': encodedObjects
        };

        return RxAVUser._objectController.save(this.state, body, RxAVUser.currentSessionToken).map(serverState => {
            return serverState != null;
        });
    }

    public static createWithoutData(objectId?: string) {
        let rtn = new RxAVRole();
        if (objectId)
            rtn.objectId = objectId;
        return rtn;
    }
}