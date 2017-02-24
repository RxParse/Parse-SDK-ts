import { RxAVObject, RxAVRole, RxAVInstallation } from '../RxLeanCloud';
import { IObjectState } from '../internal/object/state/IObjectState';
import { IUserController } from '../internal/user/controller/iUserController';
import { Observable } from 'rxjs';
/**
 * 用户
 *
 * @export
 * @class RxAVUser 一个用户对应的是 _User 的一个对象，它的查询权限是关闭的，默认是不可以通过 RxAVQuery 查询用户的
 * @extends {RxAVObject}
 */
export declare class RxAVUser extends RxAVObject {
    constructor();
    static readonly installationKey: string;
    static readonly currenUserCacheKey: string;
    private _username;
    private _primaryRole;
    email: string;
    private _mobilephone;
    roles: Array<RxAVRole>;
    static readonly currentSessionToken: any;
    private static _currentUser;
    protected static saveCurrentUser(user: RxAVUser): Observable<boolean>;
    static readonly currentUser: RxAVUser;
    /**
     * 获取本地缓存文件里面是否存在已经登录过的用户
     *
     * @readonly
     * @static
     * @type {Observable<RxAVUser>}
     * @memberOf RxAVUser
     */
    static current(): Observable<RxAVUser>;
    protected static readonly UserController: IUserController;
    /**
     * 获取用户名
     *
     *
     * @memberOf RxAVUser
     */
    /**
     * 新用户设置用户名，已注册用户调用这个接口会抛出异常
     *
     *
     * @memberOf RxAVUser
     */
    username: string;
    mobilephone: string;
    /**
     * 只有新用户可以设置密码，已注册用户调用这个接口会抛出异常
     *
     *
     * @memberOf RxAVUser
     */
    password: string;
    /**
     * 用户的鉴权信息
     *
     * @readonly
     *
     * @memberOf RxAVUser
     */
    readonly sesstionToken: any;
    /**
     * 判断当前用户的鉴权信息是否有效
     *
     * @returns {Observable<boolean>}
     *
     * @memberOf RxAVUser
     */
    isAuthenticated(): Observable<boolean>;
    setPrimaryRole(role: RxAVRole): Observable<boolean>;
    /**
     *  获取当前用户的主要角色
     *
     *
     * @memberOf RxAVUser
     */
    readonly primaryRole: any;
    /**
     * 将一个 RxAVInstallation 对象绑定到 RxAVUser
     *
     * @param {RxAVInstallation} installation
     * @param {boolean} unique
     * @returns
     *
     * @memberOf RxAVUser
     */
    activate(installation: RxAVInstallation, unique: boolean): Observable<boolean>;
    /**
     * 取消对当前设备的绑定
     *
     * @param {RxAVInstallation} installation
     * @returns
     *
     * @memberOf RxAVUser
     */
    inactive(installation: RxAVInstallation): Observable<boolean>;
    /**
     * 从服务端获取当前用户所拥有的角色
     *
     * @returns {Observable<Array<RxAVRole>>}
     *
     * @memberOf RxAVUser
     */
    fetchRoles(): Observable<Array<RxAVRole>>;
    /**
     * 使用当前用户的信息注册到 LeanCloud _User 表中
     *
     * @returns {Observable<void>}
     * 返回一个可订阅的对象，尽管是 void，但是当前 AVUser 实例对象里面的 sessionToken，objectId 都已更新
     * @memberOf RxAVUser
     */
    signUp(): Observable<boolean>;
    /**
     * 发送注册用户时需要的验证码
     *
     * @static
     * @param {string} mobilephone 手机号
     * @returns {Observable<boolean>}
     *
     * @memberOf RxAVUser
     */
    static sendSignUpShortcode(mobilephone: string): Observable<boolean>;
    /**
     * 发送登录时需要的验证码
     *
     * @static
     * @param {string} mobilephone 手机号
     * @returns {Observable<boolean>}
     *
     * @memberOf RxAVUser
     */
    static sendLogInShortcode(mobilephone: string): Observable<boolean>;
    /**
     * 使用手机号以及验证码创建新用户
     * @static
     * @param {string} mobilephone 手机号，目前支持几乎所有主流国家
     * @param {string} shortCode 6位数的数字组成的字符串
     * @returns {Observable<RxAVUser>}
     *
     * @memberOf RxAVUser
     */
    static signUpByMobilephone(mobilephone: string, shortCode: string, newUser: RxAVUser): Observable<RxAVUser>;
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
    static logInByMobilephone(mobilephone: string, shortCode: string): Observable<RxAVUser>;
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
    static logIn(username: string, password: string): Observable<RxAVUser>;
    /**
     * 登出系统，删除本地缓存
     *
     * @returns {Observable<boolean>}
     *
     * @memberOf RxAVUser
     */
    logOut(): Observable<boolean>;
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
    static logInWithMobilephone(mobilephone: string, password: string): Observable<RxAVUser>;
    /**
     * 创建一个用户，区别于 signUp，调用 create 方法并不会覆盖本地的 currentUser.
     *
     * @param {RxAVUser} user
     * @returns {Observable<boolean>}
     *
     * @memberOf RxAVUser
     */
    create(): Observable<boolean>;
    static createWithoutData(objectId?: string): RxAVUser;
    protected static processLogIn(userState: IObjectState): Observable<RxAVUser>;
    protected handlerLogIn(userState: IObjectState): Observable<boolean>;
    protected handlerSignUp(userState: IObjectState): Observable<boolean>;
}
