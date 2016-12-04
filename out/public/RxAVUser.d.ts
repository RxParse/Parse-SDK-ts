import { RxAVObject } from './RxAVObject';
import { IObjectState } from '../internal/object/state/IObjectState';
import { IUserController } from '../internal/user/controller/iUserController';
import { Observable } from 'rxjs/Observable';
export declare class RxAVUser extends RxAVObject {
    private _username;
    email: string;
    mobilephone: string;
    constructor();
    static readonly currentSessionToken: any;
    private static _currentUser;
    protected static saveCurrentUser(user: RxAVUser): void;
    static readonly currentUser: RxAVUser;
    protected readonly UserController: IUserController;
    username: string;
    password: string;
    readonly sesstionToken: any;
    signUp(): Observable<void>;
    static login(username: string, password: string): void;
    handlerSignUp(userState: IObjectState): void;
}
