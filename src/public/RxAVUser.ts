import { SDKPlugins } from '../internal/SDKPlugins';
import { RxAVClient, RxAVObject, RxAVRole, RxAVQuery, RxAVInstallation } from '../RxLeanCloud';
import { IObjectState } from '../internal/object/state/IObjectState';
import { MutableObjectState } from '../internal/object/state/MutableObjectState';
import { IUserController } from '../internal/user/controller/IUserController';
import { Observable } from 'rxjs';

/**
 * 用户
 * 
 * @export
 * @class RxAVUser 一个用户对应的是 _User 的一个对象，它的查询权限是关闭的，默认是不可以通过 RxAVQuery 查询用户的
 * @extends {RxAVObject}
 */
export class RxAVUser extends RxAVObject {
    constructor() {
        super('_User');
    }
    static readonly installationKey = 'installations';
    static readonly currenUserCacheKey = 'CurrentUser';
    private _username: string;
    private _primaryRole: RxAVRole;
    email: string;
    private _mobilephone: string;
    roles: Array<RxAVRole>;

    private static _currentUser: RxAVUser = null;
    private static _currentUsers: Map<string, RxAVUser> = new Map<string, RxAVUser>();
    protected static saveCurrentUser(user: RxAVUser) {
        RxAVUser._currentUsers.set(user.state.app.appId, user);
        return RxAVObject.saveToLocalStorage(user, `${user.state.app.appId}_${RxAVUser.currenUserCacheKey}`);
    }

    /**
     * 获取本地缓存文件里面是否存在已经登录过的用户
     * 
     * @readonly
     * @static
     * @type {Observable<RxAVUser>}
     * @memberOf RxAVUser
     */
    static current(options?: any): Observable<RxAVUser> {
        let rtn: RxAVUser = null;
        let app = RxAVClient.instance.take(options);
        if (RxAVUser._currentUsers.has(app.appId)) {
            rtn = RxAVUser._currentUsers.get(app.appId);
        } else if (SDKPlugins.instance.hasStorage) {
            return SDKPlugins.instance.LocalStorageControllerInstance.get(`${app.appId}_${RxAVUser.currenUserCacheKey}`).map(userCache => {
                if (userCache) {
                    let userState = SDKPlugins.instance.ObjectDecoder.decode(userCache, SDKPlugins.instance.Decoder);
                    userState = userState.mutatedClone((s: IObjectState) => { });
                    let user = RxAVUser.createWithoutData();
                    user.handlerLogIn(userState);
                    rtn = user;
                }
                return rtn;
            });
        }
        return Observable.from([rtn]);
    }

    static currentSessionToken(): Observable<string> {
        return RxAVUser.current().map(user => {
            if (user != null)
                return user.sesstionToken as string;
            return null;
        });
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
     * 手机号
     * 
     * @readonly
     * 
     * @memberOf RxAVUser
     */
    get mobilephone() {
        this._mobilephone = this.getProperty('mobilePhoneNumber');
        return this._mobilephone;
    }

    /**
     * 设置手机号
     * 
     * 
     * @memberOf RxAVUser
     */
    set mobilephone(mobile: string) {
        if (this.sesstionToken == null) {
            this._mobilephone = mobile;
            this.set('mobilePhoneNumber', this._mobilephone);
        }
        else {
            throw new Error('can not reset mobilephone.');
        }
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
            throw new Error('can not set password for a exist user, if you want to reset password, please call requestResetPassword.');
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
            return !!this.sesstionToken && RxAVClient.runCommand('/users/me', 'GET', null, this.sesstionToken, this.state.app).map(body => {
                return true;
            });
        } catch (error) {
            return Observable.from([error.error.code == 211]);
        }
    }

    /**
     * 将一个 RxAVInstallation 对象绑定到 RxAVUser
     * 
     * @param {RxAVInstallation} installation
     * @param {boolean} unique
     * @returns {Observable<boolean>} 是否成功地绑定了当前设备和 User 的关系
     * 
     * @memberOf RxAVUser
     */
    public activate(installation: RxAVInstallation, unique: boolean): Observable<boolean> {
        if (!installation || installation == null || !installation.objectId || installation.objectId == null) {
            throw new Error('installation can not be a unsaved object.')
        }
        let ch: Observable<boolean>;
        if (unique) {
            this.remove(RxAVUser.installationKey);
            ch = this.save();
        } else {
            ch = Observable.from([true]);
        }
        let opBody = this.buildRelation('add', [installation]);
        this.set(RxAVUser.installationKey, opBody);
        return ch.flatMap(s1 => {
            return this.save();
        });
    }

    /**
     * 取消对当前设备的绑定
     * 
     * @param {RxAVInstallation} installation
     * @returns {Observable<boolean>} 是否成功的解绑
     * 
     * @memberOf RxAVUser
     */
    public inactive(installation: RxAVInstallation): Observable<boolean> {
        let opBody = this.buildRelation('remove', [installation]);
        this.set(RxAVUser.installationKey, opBody);
        return this.save();
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
        return RxAVClient.runCommand('/requestSmsCode', 'POST', data).map(body => {
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
        return RxAVClient.runCommand('/requestLoginSmsCode', 'POST', data).map(body => {
            return true;
        });
    }

    /**
     * 使用手机号以及验证码创建新用户
     * @static
     * @param {string} mobilephone 手机号，目前支持几乎所有主流国家
     * @param {string} shortCode 6位数的数字组成的字符串
     * @returns {Observable<RxAVUser>}
     * 
     * @memberOf RxAVUser
     */
    public static signUpByMobilephone(mobilephone: string, shortCode: string, newUser: RxAVUser): Observable<RxAVUser> {
        let encoded = SDKPlugins.instance.Encoder.encode(newUser.estimatedData);
        encoded['mobilePhoneNumber'] = mobilephone;
        encoded['smsCode'] = shortCode;

        return RxAVUser.UserController.logInWithParamters('/usersByMobilePhone', encoded).flatMap(userState => {
            let user = RxAVUser.createWithoutData();
            if (userState.isNew)
                return user.handlerSignUp(userState).map(s => {
                    return user;
                });
            else {
                return RxAVUser.processLogIn(userState);
            }
        });
    }

    /**
     * 使用手机号以及验证码登录
     * 
     * @static
     * @param {string} mobilephone
     * @param {string} shortCode
     * @returns {Observable<RxAVUser>}
     * 
     * @memberOf RxAVUser
     */
    public static logInByMobilephone(mobilephone: string, shortCode: string): Observable<RxAVUser> {
        let data = {
            "mobilePhoneNumber": mobilephone,
            "smsCode": shortCode
        };
        return RxAVUser.UserController.logInWithParamters('/usersByMobilePhone', data).flatMap(userState => {
            let user = RxAVUser.createWithoutData();
            if (userState.isNew)
                return user.handlerSignUp(userState).map(s => {
                    return user;
                });
            else {
                return RxAVUser.processLogIn(userState);
            }
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
    public static logIn(username: string, password: string): Observable<RxAVUser> {
        return RxAVUser.UserController.logIn(username, password).flatMap(userState => {
            return RxAVUser.processLogIn(userState);
        });
    }

    /**
     * 登出系统，删除本地缓存
     * 
     * @returns {Observable<boolean>}
     * 
     * @memberOf RxAVUser
     */
    public logOut(): Observable<boolean> {
        return RxAVUser.saveCurrentUser(null);
    }

    /**
     *  使用手机号+密码登录
     * 
     * @static
     * @param {string} mobilephone 手机号
     * @param {string} password 密码
     * @returns {Observable<RxAVUser>}
     * 
     * @memberOf RxAVUser
     */
    public static logInWithMobilephone(mobilephone: string, password: string): Observable<RxAVUser> {
        let data = {
            "mobilePhoneNumber": mobilephone,
            "password": password
        };
        return RxAVUser.UserController.logInWithParamters('/login', data).flatMap(userState => {
            return RxAVUser.processLogIn(userState);
        });
    }

    /**
     * 创建一个用户，区别于 signUp，调用 create 方法并不会覆盖本地的 currentUser.
     * 
     * @param {RxAVUser} user
     * @returns {Observable<boolean>}
     * 
     * @memberOf RxAVUser
     */
    public create(): Observable<boolean> {
        return RxAVUser.UserController.signUp(this.state, this.estimatedData).map(userState => {
            super.handlerSave(userState);
            this.state.serverData = userState.serverData;
            return true;
        });
    }

    // /**
    //  * 
    //  * 
    //  * @param {{ [key: string]: any }} authData 
    //  * 
    //  * @memberOf RxAVUser
    //  */
    // public logInWithOAuth2Data(authData: { [key: string]: any }) {

    // }

    public static createWithoutData(objectId?: string) {
        return RxAVObject.createSubclass(RxAVUser, objectId);
    }

    protected static processLogIn(userState: IObjectState): Observable<RxAVUser> {
        let user = RxAVUser.createWithoutData();
        return user.handlerLogIn(userState).map(s => {
            if (s)
                return user;
            else Observable.from([null]);
        });
    }

    protected handlerLogIn(userState: IObjectState) {
        this.handleFetchResult(userState);
        return RxAVUser.saveCurrentUser(this);
    }

    protected handlerSignUp(userState: IObjectState) {
        super.handlerSave(userState);
        this.state.serverData = userState.serverData;
        return RxAVUser.saveCurrentUser(this);
    }

}