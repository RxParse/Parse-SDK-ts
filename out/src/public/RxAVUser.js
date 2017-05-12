"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const SDKPlugins_1 = require("../internal/SDKPlugins");
const RxLeanCloud_1 = require("../RxLeanCloud");
const rxjs_1 = require("rxjs");
/**
 * 用户
 *
 * @export
 * @class RxAVUser 一个用户对应的是 _User 的一个对象，它的查询权限是关闭的，默认是不可以通过 RxAVQuery 查询用户的
 * @extends {RxAVObject}
 */
class RxAVUser extends RxLeanCloud_1.RxAVObject {
    constructor() {
        super('_User');
    }
    static saveCurrentUser(user) {
        RxAVUser._currentUsers.set(user.state.app.appId, user);
        return RxLeanCloud_1.RxAVObject.saveToLocalStorage(user, `${user.state.app.appId}_${RxAVUser.currenUserCacheKey}`);
    }
    /**
     * 获取本地缓存文件里面是否存在已经登录过的用户
     *
     * @readonly
     * @static
     * @type {Observable<RxAVUser>}
     * @memberOf RxAVUser
     */
    static current(options) {
        let rtn = null;
        let app = RxLeanCloud_1.RxAVClient.instance.take(options);
        if (RxAVUser._currentUsers.has(app.appId)) {
            rtn = RxAVUser._currentUsers.get(app.appId);
        }
        else if (SDKPlugins_1.SDKPlugins.instance.hasStorage) {
            return SDKPlugins_1.SDKPlugins.instance.LocalStorageControllerInstance.get(`${app.appId}_${RxAVUser.currenUserCacheKey}`).map(userCache => {
                if (userCache) {
                    let userState = SDKPlugins_1.SDKPlugins.instance.ObjectDecoder.decode(userCache, SDKPlugins_1.SDKPlugins.instance.Decoder);
                    userState = userState.mutatedClone((s) => { });
                    let user = RxAVUser.createWithoutData();
                    user.handlerLogIn(userState);
                    rtn = user;
                }
                return rtn;
            });
        }
        return rxjs_1.Observable.from([rtn]);
    }
    static currentSessionToken() {
        return RxAVUser.current().map(user => {
            if (user != null)
                return user.sesstionToken;
            return null;
        });
    }
    static get UserController() {
        return SDKPlugins_1.SDKPlugins.instance.UserControllerInstance;
    }
    /**
     * 新用户设置用户名，已注册用户调用这个接口会抛出异常
     *
     *
     * @memberOf RxAVUser
     */
    set username(username) {
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
    set mobilephone(mobile) {
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
    set password(password) {
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
    isAuthenticated() {
        try {
            return !!this.sesstionToken && RxLeanCloud_1.RxAVClient.runCommand('/users/me', 'GET', null, this.sesstionToken, this.state.app).map(body => {
                return true;
            });
        }
        catch (error) {
            return rxjs_1.Observable.from([error.error.code == 211]);
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
    activate(installation, unique) {
        if (!installation || installation == null || !installation.objectId || installation.objectId == null) {
            throw new Error('installation can not be a unsaved object.');
        }
        let ch;
        if (unique) {
            this.remove(RxAVUser.installationKey);
            ch = this.save();
        }
        else {
            ch = rxjs_1.Observable.from([true]);
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
    inactive(installation) {
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
    fetchRoles() {
        let query = new RxLeanCloud_1.RxAVQuery('_Role');
        query.equalTo('users', this);
        return query.find().map(roles => {
            let fetched = roles.map(currentItem => {
                let role = RxLeanCloud_1.RxAVRole.createWithName(currentItem.get('name'), currentItem.objectId);
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
    signUp() {
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
    static sendSignUpShortcode(mobilephone) {
        let data = {
            mobilePhoneNumber: mobilephone
        };
        return RxLeanCloud_1.RxAVClient.runCommand('/requestSmsCode', 'POST', data).map(body => {
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
    static sendLogInShortcode(mobilephone) {
        let data = {
            mobilePhoneNumber: mobilephone
        };
        return RxLeanCloud_1.RxAVClient.runCommand('/requestLoginSmsCode', 'POST', data).map(body => {
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
    static signUpByMobilephone(mobilephone, shortCode, newUser) {
        let encoded = SDKPlugins_1.SDKPlugins.instance.Encoder.encode(newUser.estimatedData);
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
    static logInByMobilephone(mobilephone, shortCode) {
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
    static logIn(username, password) {
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
    logOut() {
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
    static logInWithMobilephone(mobilephone, password) {
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
    create() {
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
    static createWithoutData(objectId) {
        return RxLeanCloud_1.RxAVObject.createSubclass(RxAVUser, objectId);
    }
    static processLogIn(userState) {
        let user = RxAVUser.createWithoutData();
        return user.handlerLogIn(userState).map(s => {
            if (s)
                return user;
            else
                rxjs_1.Observable.from([null]);
        });
    }
    handlerLogIn(userState) {
        this.handleFetchResult(userState);
        return RxAVUser.saveCurrentUser(this);
    }
    handlerSignUp(userState) {
        super.handlerSave(userState);
        this.state.serverData = userState.serverData;
        return RxAVUser.saveCurrentUser(this);
    }
}
RxAVUser.installationKey = 'installations';
RxAVUser.currenUserCacheKey = 'CurrentUser';
RxAVUser._currentUser = null;
RxAVUser._currentUsers = new Map();
exports.RxAVUser = RxAVUser;
