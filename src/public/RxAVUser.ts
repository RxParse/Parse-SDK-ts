import { SDKPlugins } from '../internal/SDKPlugins';
import { RxAVClient, RxAVObject, RxAVRole, RxAVQuery } from '../RxLeanCloud';
import { IObjectState } from '../internal/object/state/IObjectState';
import { MutableObjectState } from '../internal/object/state/MutableObjectState';
import { IUserController } from '../internal/user/controller/iUserController';
import { Observable } from 'rxjs';

/**
 * 用户
 * 
 * @export
 * @class RxAVUser 一个用户对应的是 _User 的一个对象，它的查询权限是关闭的，默认是不可以通过 RxAVQuery 查询用户的
 * @extends {RxAVObject}
 */
export class RxAVUser extends RxAVObject {
    private _username: string;
    private _primaryRole: RxAVRole;
    email: string;
    mobilephone: string;
    roles: Array<RxAVRole>;

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


    /**
     * 新用户设置用户名，已注册用户调用这个接口会抛出异常
     * 
     * 
     * @memberOf RxAVUser
     */
    set username(username: string) {
        if (this.sesstionToken == null) {
            this._username = username;
            this.set('username', this._username);
        }
        else {
            throw new Error('can not reset username.');
        }
    }


    /**
     * 获取用户名
     * 
     * 
     * @memberOf RxAVUser
     */
    get username() {
        this._username = this.getProperty('username');
        return this._username;
    }

    /**
     * 只有新用户可以设置密码，已注册用户调用这个接口会抛出异常
     * 
     * 
     * @memberOf RxAVUser
     */
    set password(password: string) {
        if (this.sesstionToken == null)
            this.set('password', password);
        else {
            throw new Error('can not set password for a exist user,if you want to reset password,please call requestResetPassword.');
        }
    }

    /**
     * 用户的鉴权信息
     * 
     * @readonly
     * 
     * @memberOf RxAVUser
     */
    get sesstionToken() {
        return this.getProperty('sessionToken');
    }

    /**
     * 判断当前用户的鉴权信息是否有效
     * 
     * @returns {Observable<boolean>}
     * 
     * @memberOf RxAVUser
     */
    public isAuthenticated(): Observable<boolean> {
        try {
            return !!this.sesstionToken && RxAVClient.request('/users/me', 'GET', null, this.sesstionToken).map(body => {
                return true;
            });
        } catch (error) {
            return Observable.from([error.error.code == 211]);
        }
    }

    public setPrimaryRole(role: RxAVRole) {
        this.set('primaryRole', role);
        if (role.isDirty)
            return role.save().flatMap<boolean>(s1 => {
                return role.assign(this);
            }).flatMap<boolean>(s2 => {
                return this.save();
            });
        else return role.assign(this).flatMap<boolean>(s3 => {
            return this.save();
        });
    }

    /**
     *  获取当前用户的主要角色
     * 
     * 
     * @memberOf RxAVUser
     */
    get primaryRole() {
        return this.get('primaryRole');
    }

    /**
     * 从服务端获取当前用户所拥有的角色
     * 
     * @returns {Observable<Array<RxAVRole>>}
     * 
     * @memberOf RxAVUser
     */
    public fetchRoles(): Observable<Array<RxAVRole>> {
        let query = new RxAVQuery('_Role');
        query.equalTo('users', this);
        return query.find().map(roles => {
            let fetched = roles.map(currentItem => {
                let role = RxAVRole.createWithName(currentItem.get('name'), currentItem.objectId);
                return role;
            });
            this.roles = fetched;
            return fetched;
        });
    }


    /**
     * 使用当前用户的信息注册到 LeanCloud _User 表中
     * 
     * @returns {Observable<void>}
     * 返回一个可订阅的对象，尽管是 void，但是当前 AVUser 实例对象里面的 sessionToken，objectId 都已更新
     * @memberOf RxAVUser
     */
    public signUp(): Observable<boolean> {
        return RxAVUser.UserController.signUp(this.state, this.estimatedData).map(userState => {
            this.handlerSignUp(userState);
            return true;
        });
    }

    /**
     * 发送注册用户时需要的验证码
     * 
     * @static
     * @param {string} mobilephone 手机号
     * @returns {Observable<boolean>}
     * 
     * @memberOf RxAVUser
     */
    public static sendSignUpShortcode(mobilephone: string): Observable<boolean> {
        let data = {
            mobilePhoneNumber: mobilephone
        };
        return RxAVClient.request('/requestSmsCode', 'POST', data).map(body => {
            return true;
        });
    }

    /**
     * 发送登录时需要的验证码
     * 
     * @static
     * @param {string} mobilephone 手机号
     * @returns {Observable<boolean>}
     * 
     * @memberOf RxAVUser
     */
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
            user.handlerLogIn(userState);
            return user;
        });
    }

    public static createWithoutData(objectId?: string) {
        let rtn = new RxAVUser();
        if (objectId)
            rtn.objectId = objectId;
        return rtn;
    }

    protected handlerLogIn(userState: IObjectState) {
        this.handleFetchResult(userState);
        RxAVUser.saveCurrentUser(this);
    }

    protected handlerSignUp(userState: IObjectState) {
        super.handlerSave(userState);
        RxAVUser.saveCurrentUser(this);
        this.state.serverData = userState.serverData;
    }

}