import { SDKPlugins } from '../internal/SDKPlugins';
import { RxAVClient, RxAVObject } from '../RxLeanCloud';
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

    protected static get UserController() {
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


    /**
     * 使用当前用户的信息注册到 LeanCloud _User 表中
     * 
     * @returns {Observable<void>}
     * 返回一个可订阅的对象，尽管是 void，但是当前 AVUser 实例对象里面的 sessionToken，objectId 都已更新
     * @memberOf RxAVUser
     */
    signUp(): Observable<void> {
        return RxAVUser.UserController.signUp(this.state, this.estimatedData).map(userState => {
            this.handlerSignUp(userState);
        });
    }

    public static sendSignUpShortcode(mobilephone: string): Observable<boolean> {
        let data = {
            mobilePhoneNumber: mobilephone
        };
        return RxAVClient.request('/requestSmsCode', 'POST', data).map(body => {
            return true;
        });
    }

    public static sendLogInShortcode(mobilephone: string): Observable<boolean> {
        let data = {
            mobilePhoneNumber: mobilephone
        };
        return RxAVClient.request('/requestLoginSmsCode', 'POST', data).map(body => {
            return true;
        });
    }

    /**
     * 使用手机号一键登录
     * 如果手机号未被注册过，则会返回一个新用户;
     * 如果手机号之前注册过，那就直接走登录接口不会产生新用户.
     * @static
     * @param {string} mobilephone 手机号，目前支持几乎所有主流国家
     * @param {string} shortCode 6位数的数字组成的字符串
     * @returns {Observable<RxAVUser>}
     * 
     * @memberOf RxAVUser
     */
    public static signUpByMobilephone(mobilephone: string, shortCode: string): Observable<RxAVUser> {
        let data = {
            "mobilePhoneNumber": mobilephone,
            "smsCode": shortCode
        };
        return RxAVUser.UserController.logInWithParamters('/usersByMobilePhone', data).map(userState => {
            let user = RxAVUser.createWithoutData();
            if (userState.isNew)
                user.handlerSignUp(userState);
            else {
                user.handleFetchResult(userState);
            }
            return user;
        });
    }

    /**
     * 使用用户名和密码登录
     * 
     * @static
     * @param {string} username 用户名
     * @param {string} password 密码
     * @returns {Observable<RxAVUser>}
     * 
     * @memberOf RxAVUser
     */
    public static login(username: string, password: string): Observable<RxAVUser> {
        return RxAVUser.UserController.logIn(username, password).map(userState => {
            let user = RxAVUser.createWithoutData();
            user.handleFetchResult(userState);
            return user;
        });
    }

    public static createWithoutData(objectId?: string) {
        let rtn = new RxAVUser();
        if (objectId)
            rtn.objectId = objectId;
        return rtn;
    }

    protected handlerSignUp(userState: IObjectState) {
        super.handlerSave(userState);
        RxAVUser.saveCurrentUser(this);
        this.state.serverData = userState.serverData;
    }

}