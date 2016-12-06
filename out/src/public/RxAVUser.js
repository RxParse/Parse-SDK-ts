"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var SDKPlugins_1 = require('../internal/SDKPlugins');
var RxLeanCloud_1 = require('../RxLeanCloud');
var rxjs_1 = require('@reactivex/rxjs');
/**
 * 用户
 *
 * @export
 * @class RxAVUser 一个用户对应的是 _User 的一个对象，它的查询权限是关闭的，默认是不可以通过 RxAVQuery 查询用户的
 * @extends {RxAVObject}
 */
var RxAVUser = (function (_super) {
    __extends(RxAVUser, _super);
    function RxAVUser() {
        _super.call(this, '_User');
    }
    Object.defineProperty(RxAVUser, "currentSessionToken", {
        get: function () {
            if (RxAVUser._currentUser) {
                return RxAVUser._currentUser.sesstionToken;
            }
            return null;
        },
        enumerable: true,
        configurable: true
    });
    RxAVUser.saveCurrentUser = function (user) {
        RxAVUser._currentUser = user;
    };
    Object.defineProperty(RxAVUser, "currentUser", {
        get: function () {
            return RxAVUser._currentUser;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(RxAVUser, "UserController", {
        get: function () {
            return SDKPlugins_1.SDKPlugins.instance.UserControllerInstance;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(RxAVUser.prototype, "username", {
        /**
         * 获取用户名
         *
         *
         * @memberOf RxAVUser
         */
        get: function () {
            this._username = this.getProperty('username');
            return this._username;
        },
        /**
         * 新用户设置用户名，已注册用户调用这个接口会抛出异常
         *
         *
         * @memberOf RxAVUser
         */
        set: function (username) {
            if (this.sesstionToken == null) {
                this._username = username;
                this.set('username', this._username);
            }
            else {
                throw new Error('can not reset username.');
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(RxAVUser.prototype, "password", {
        /**
         * 只有新用户可以设置密码，已注册用户调用这个接口会抛出异常
         *
         *
         * @memberOf RxAVUser
         */
        set: function (password) {
            if (this.sesstionToken == null)
                this.set('password', password);
            else {
                throw new Error('can not set password for a exist user,if you want to reset password,please call requestResetPassword.');
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(RxAVUser.prototype, "sesstionToken", {
        /**
         * 用户的鉴权信息
         *
         * @readonly
         *
         * @memberOf RxAVUser
         */
        get: function () {
            return this.getProperty('sessionToken');
        },
        enumerable: true,
        configurable: true
    });
    /**
     * 判断当前用户的鉴权信息是否有效
     *
     * @returns {Observable<boolean>}
     *
     * @memberOf RxAVUser
     */
    RxAVUser.prototype.isAuthenticated = function () {
        try {
            return !!this.sesstionToken && RxLeanCloud_1.RxAVClient.request('/users/me', 'GET', null, this.sesstionToken).map(function (body) {
                return true;
            });
        }
        catch (error) {
            return rxjs_1.Observable.from([error.error.code == 211]);
        }
    };
    /**
     * 使用当前用户的信息注册到 LeanCloud _User 表中
     *
     * @returns {Observable<void>}
     * 返回一个可订阅的对象，尽管是 void，但是当前 AVUser 实例对象里面的 sessionToken，objectId 都已更新
     * @memberOf RxAVUser
     */
    RxAVUser.prototype.signUp = function () {
        var _this = this;
        return RxAVUser.UserController.signUp(this.state, this.estimatedData).map(function (userState) {
            _this.handlerSignUp(userState);
        });
    };
    /**
     * 发送注册用户时需要的验证码
     *
     * @static
     * @param {string} mobilephone 手机号
     * @returns {Observable<boolean>}
     *
     * @memberOf RxAVUser
     */
    RxAVUser.sendSignUpShortcode = function (mobilephone) {
        var data = {
            mobilePhoneNumber: mobilephone
        };
        return RxLeanCloud_1.RxAVClient.request('/requestSmsCode', 'POST', data).map(function (body) {
            return true;
        });
    };
    /**
     * 发送登录时需要的验证码
     *
     * @static
     * @param {string} mobilephone 手机号
     * @returns {Observable<boolean>}
     *
     * @memberOf RxAVUser
     */
    RxAVUser.sendLogInShortcode = function (mobilephone) {
        var data = {
            mobilePhoneNumber: mobilephone
        };
        return RxLeanCloud_1.RxAVClient.request('/requestLoginSmsCode', 'POST', data).map(function (body) {
            return true;
        });
    };
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
    RxAVUser.signUpByMobilephone = function (mobilephone, shortCode) {
        var data = {
            "mobilePhoneNumber": mobilephone,
            "smsCode": shortCode
        };
        return RxAVUser.UserController.logInWithParamters('/usersByMobilePhone', data).map(function (userState) {
            var user = RxAVUser.createWithoutData();
            if (userState.isNew)
                user.handlerSignUp(userState);
            else {
                user.handleFetchResult(userState);
            }
            return user;
        });
    };
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
    RxAVUser.login = function (username, password) {
        return RxAVUser.UserController.logIn(username, password).map(function (userState) {
            var user = RxAVUser.createWithoutData();
            user.handleFetchResult(userState);
            return user;
        });
    };
    RxAVUser.createWithoutData = function (objectId) {
        var rtn = new RxAVUser();
        if (objectId)
            rtn.objectId = objectId;
        return rtn;
    };
    RxAVUser.prototype.handlerSignUp = function (userState) {
        _super.prototype.handlerSave.call(this, userState);
        RxAVUser.saveCurrentUser(this);
        this.state.serverData = userState.serverData;
    };
    return RxAVUser;
}(RxLeanCloud_1.RxAVObject));
exports.RxAVUser = RxAVUser;
