import { SDKPlugins } from '../internal/SDKPlugins';
import { RxAVObject } from './RxAVObject';
import { IObjectState } from '../internal/object/state/IObjectState';
import { MutableObjectState } from '../internal/object/state/MutableObjectState';
import { IUserController } from '../internal/user/controller/iUserController';
import { Observable } from 'rxjs/Observable';

export class RxAVUser extends RxAVObject {
    private _username: string;
    email: string;
    mobilephone: string;

    constructor() {
        super('_User');
    }

    static get currentSessionToken() {
        if (RxAVUser._currentUser) {
            return RxAVUser._currentUser.sesstionToken;
        }
        return null;
    }
    private static _currentUser: RxAVUser;
    protected static saveCurrentUser(user: RxAVUser) {
        RxAVUser._currentUser = user;
    }
    static get currentUser() {
        return RxAVUser._currentUser;
    }

    protected get UserController() {
        return SDKPlugins.instance.UserControllerInstance;
    }

    set username(username: string) {
        this._username = username;
        this.set('username', this._username);
    }
    get username() {
        return this._username;
    }

    set password(password: string) {
        if (this.sesstionToken == null)
            this.set('password', password);
        else {
            throw new Error('can not set password for a exist user,if you want to reset password,please call requestResetPassword.');
        }
    }

    get sesstionToken() {
        return this.getProperty('sessionToken');
    }
    
    signUp() {
        return this.UserController.signUp(this.state, this.estimatedData).map(userState => {
            this.handlerSignUp(userState);
            RxAVUser.saveCurrentUser(this);
        });
    }

    static login(username: string, password: string) {

    }

    handlerSignUp(userState: IObjectState) {
        super.handlerSave(userState);
        this.state.serverData = userState.serverData;
    }
}