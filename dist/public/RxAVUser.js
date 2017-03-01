"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var SDKPlugins_1 = require('../internal/SDKPlugins');
var RxLeanCloud_1 = require('../RxLeanCloud');
var rxjs_1 = require('rxjs');
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
        return RxLeanCloud_1.RxAVObject.saveToLocalStorage(user, RxAVUser.currenUserCacheKey);
    };
    Object.defineProperty(RxAVUser, "currentUser", {
        get: function () {
            return RxAVUser._currentUser;
        },
        enumerable: true,
        configurable: true
    });
    /**
     * 获取本地缓存文件里面是否存在已经登录过的用户
     *
     * @readonly
     * @static
     * @type {Observable<RxAVUser>}
     * @memberOf RxAVUser
     */
    RxAVUser.current = function () {
        return SDKPlugins_1.SDKPlugins.instance.LocalStorageControllerInstance.get(RxAVUser.currenUserCacheKey).map(function (userCache) {
            if (userCache) {
                var userState = SDKPlugins_1.SDKPlugins.instance.ObjectDecoder.decode(userCache, SDKPlugins_1.SDKPlugins.instance.Decoder);
                userState = userState.mutatedClone(function (s) { });
                var user = RxAVUser.createWithoutData();
                user.handlerLogIn(userState);
                RxAVUser._currentUser = user;
            }
            return RxAVUser._currentUser;
        });
    };
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
    Object.defineProperty(RxAVUser.prototype, "mobilephone", {
        /**
         * 手机号
         *
         * @readonly
         *
         * @memberOf RxAVUser
         */
        get: function () {
            this._mobilephone = this.getProperty('mobilePhoneNumber');
            return this._mobilephone;
        },
        /**
         * 设置手机号
         *
         *
         * @memberOf RxAVUser
         */
        set: function (mobile) {
            if (this.sesstionToken == null) {
                this._mobilephone = mobile;
                this.set('mobilePhoneNumber', this._mobilephone);
            }
            else {
                throw new Error('can not reset mobilephone.');
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
                throw new Error('can not set password for a exist user, if you want to reset password, please call requestResetPassword.');
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
    // public setPrimaryRole(role: RxAVRole) {
    //     this.set('primaryRole', role);
    //     if (role.isDirty)
    //         return role.save().flatMap<boolean>(s1 => {
    //             return role.grant(this);
    //         }).flatMap<boolean>(s2 => {
    //             return this.save();
    //         });
    //     else return role.grant(this).flatMap<boolean>(s3 => {
    //         return this.save();
    //     });
    // }
    // /**
    //  *  获取当前用户的主要角色
    //  * 
    //  * 
    //  * @memberOf RxAVUser
    //  */
    // get primaryRole() {
    //     return this.get('primaryRole');
    // }
    /**
     * 将一个 RxAVInstallation 对象绑定到 RxAVUser
     *
     * @param {RxAVInstallation} installation
     * @param {boolean} unique
     * @returns {Observable<boolean>} 是否成功地绑定了当前设备和 User 的关系
     *
     * @memberOf RxAVUser
     */
    RxAVUser.prototype.activate = function (installation, unique) {
        var _this = this;
        if (!installation || installation == null || !installation.objectId || installation.objectId == null) {
            throw new Error('installation can not be a unsaved object.');
        }
        var ch;
        if (unique) {
            this.remove(RxAVUser.installationKey);
            ch = this.save();
        }
        else {
            ch = rxjs_1.Observable.from([true]);
        }
        var opBody = this.buildRelation('add', [installation]);
        this.set(RxAVUser.installationKey, opBody);
        return ch.flatMap(function (s1) {
            return _this.save();
        });
    };
    /**
     * 取消对当前设备的绑定
     *
     * @param {RxAVInstallation} installation
     * @returns {Observable<boolean>} 是否成功的解绑
     *
     * @memberOf RxAVUser
     */
    RxAVUser.prototype.inactive = function (installation) {
        var opBody = this.buildRelation('remove', [installation]);
        this.set(RxAVUser.installationKey, opBody);
        return this.save();
    };
    /**
     * 从服务端获取当前用户所拥有的角色
     *
     * @returns {Observable<Array<RxAVRole>>}
     *
     * @memberOf RxAVUser
     */
    RxAVUser.prototype.fetchRoles = function () {
        var _this = this;
        var query = new RxLeanCloud_1.RxAVQuery('_Role');
        query.equalTo('users', this);
        return query.find().map(function (roles) {
            var fetched = roles.map(function (currentItem) {
                var role = RxLeanCloud_1.RxAVRole.createWithName(currentItem.get('name'), currentItem.objectId);
                return role;
            });
            _this.roles = fetched;
            return fetched;
        });
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
            return true;
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
     * 使用手机号以及验证码创建新用户
     * @static
     * @param {string} mobilephone 手机号，目前支持几乎所有主流国家
     * @param {string} shortCode 6位数的数字组成的字符串
     * @returns {Observable<RxAVUser>}
     *
     * @memberOf RxAVUser
     */
    RxAVUser.signUpByMobilephone = function (mobilephone, shortCode, newUser) {
        var encoded = SDKPlugins_1.SDKPlugins.instance.Encoder.encode(newUser.estimatedData);
        encoded['mobilePhoneNumber'] = mobilephone;
        encoded['smsCode'] = shortCode;
        return RxAVUser.UserController.logInWithParamters('/usersByMobilePhone', encoded).flatMap(function (userState) {
            var user = RxAVUser.createWithoutData();
            if (userState.isNew)
                return user.handlerSignUp(userState).map(function (s) {
                    return user;
                });
            else {
                return RxAVUser.processLogIn(userState);
            }
        });
    };
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
    RxAVUser.logInByMobilephone = function (mobilephone, shortCode) {
        var data = {
            "mobilePhoneNumber": mobilephone,
            "smsCode": shortCode
        };
        return RxAVUser.UserController.logInWithParamters('/usersByMobilePhone', data).flatMap(function (userState) {
            var user = RxAVUser.createWithoutData();
            if (userState.isNew)
                return user.handlerSignUp(userState).map(function (s) {
                    return user;
                });
            else {
                return RxAVUser.processLogIn(userState);
            }
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
    RxAVUser.logIn = function (username, password) {
        return RxAVUser.UserController.logIn(username, password).flatMap(function (userState) {
            return RxAVUser.processLogIn(userState);
        });
    };
    /**
     * 登出系统，删除本地缓存
     *
     * @returns {Observable<boolean>}
     *
     * @memberOf RxAVUser
     */
    RxAVUser.prototype.logOut = function () {
        return RxAVUser.saveCurrentUser(null);
    };
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
    RxAVUser.logInWithMobilephone = function (mobilephone, password) {
        var data = {
            "mobilePhoneNumber": mobilephone,
            "password": password
        };
        return RxAVUser.UserController.logInWithParamters('/login', data).flatMap(function (userState) {
            return RxAVUser.processLogIn(userState);
        });
    };
    /**
     * 创建一个用户，区别于 signUp，调用 create 方法并不会覆盖本地的 currentUser.
     *
     * @param {RxAVUser} user
     * @returns {Observable<boolean>}
     *
     * @memberOf RxAVUser
     */
    RxAVUser.prototype.create = function () {
        var _this = this;
        return RxAVUser.UserController.signUp(this.state, this.estimatedData).map(function (userState) {
            _super.prototype.handlerSave.call(_this, userState);
            _this.state.serverData = userState.serverData;
            return true;
        });
    };
    // /**
    //  * 
    //  * 
    //  * @param {{ [key: string]: any }} authData 
    //  * 
    //  * @memberOf RxAVUser
    //  */
    // public logInWithOAuth2Data(authData: { [key: string]: any }) {
    // }
    RxAVUser.createWithoutData = function (objectId) {
        return RxLeanCloud_1.RxAVObject.createSubclass(RxAVUser, objectId);
    };
    RxAVUser.processLogIn = function (userState) {
        var user = RxAVUser.createWithoutData();
        return user.handlerLogIn(userState).map(function (s) {
            if (s)
                return user;
            else
                rxjs_1.Observable.from([null]);
        });
    };
    RxAVUser.prototype.handlerLogIn = function (userState) {
        this.handleFetchResult(userState);
        return RxAVUser.saveCurrentUser(this);
    };
    RxAVUser.prototype.handlerSignUp = function (userState) {
        _super.prototype.handlerSave.call(this, userState);
        this.state.serverData = userState.serverData;
        return RxAVUser.saveCurrentUser(this);
    };
    RxAVUser.installationKey = 'installations';
    RxAVUser.currenUserCacheKey = 'CurrentUser';
    RxAVUser._currentUser = null;
    return RxAVUser;
}(RxLeanCloud_1.RxAVObject));
exports.RxAVUser = RxAVUser;
