import { RxAVObject } from '../RxLeanCloud';
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
    private _username;
    email: string;
    mobilephone: string;
    constructor();
    static readonly currentSessionToken: any;
    private static _currentUser;
    protected static saveCurrentUser(user: RxAVUser): void;
    static readonly currentUser: RxAVUser;
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
    /**
     * 使用当前用户的信息注册到 LeanCloud _User 表中
     *
     * @returns {Observable<void>}
     * 返回一个可订阅的对象，尽管是 void，但是当前 AVUser 实例对象里面的 sessionToken，objectId 都已更新
     * @memberOf RxAVUser
     */
    signUp(): Observable<void>;
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
    static signUpByMobilephone(mobilephone: string, shortCode: string): Observable<RxAVUser>;
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
    static login(username: string, password: string): Observable<RxAVUser>;
    static createWithoutData(objectId?: string): RxAVUser;
    protected handlerLogIn(userState: IObjectState): void;
    protected handlerSignUp(userState: IObjectState): void;
}
