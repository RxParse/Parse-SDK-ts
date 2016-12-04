import { RxAVObject } from '../RxLeanCloud';
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
    protected static readonly UserController: IUserController;
    username: string;
    password: string;
    readonly sesstionToken: any;
    /**
     * 使用当前用户的信息注册到 LeanCloud _User 表中
     *
     * @returns {Observable<void>}
     * 返回一个可订阅的对象，尽管是 void，但是当前 AVUser 实例对象里面的 sessionToken，objectId 都已更新
     * @memberOf RxAVUser
     */
    signUp(): Observable<void>;
    static sendSignUpShortcode(mobilephone: string): Observable<boolean>;
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
    protected handlerSignUp(userState: IObjectState): void;
}
