import { RxAVObject, RxAVACL, RxAVUser } from '../RxLeanCloud';
import { Observable } from 'rxjs';
export declare class RxAVRole extends RxAVObject {
    constructor(name?: string, acl?: RxAVACL);
    private _name;
    readonly name: string;
    users: Array<RxAVUser>;
    roles: Array<RxAVRole>;
    assign(...args: any[]): Observable<boolean>;
    deprive(...args: any[]): Observable<boolean>;
    inherit(...args: any[]): Observable<boolean>;
    disinherit(...args: any[]): Observable<boolean>;
    protected _setRelation(field: string, op: string, className: string, ...args: any[]): Observable<boolean>;
    static createWithoutData(objectId?: string): RxAVRole;
}
