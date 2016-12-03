"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var SDKPlugins_1 = require('../internal/SDKPlugins');
var RxAVObject_1 = require('./RxAVObject');
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
    Object.defineProperty(RxAVUser.prototype, "UserController", {
        get: function () {
            return SDKPlugins_1.SDKPlugins.instance.UserControllerInstance;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(RxAVUser.prototype, "username", {
        get: function () {
            return this._username;
        },
        set: function (username) {
            this._username = username;
            this.set('username', this._username);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(RxAVUser.prototype, "password", {
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
        get: function () {
            return this.getProperty('sessionToken');
        },
        enumerable: true,
        configurable: true
    });
    RxAVUser.prototype.signUp = function () {
        var _this = this;
        return this.UserController.signUp(this.state, this.estimatedData).map(function (userState) {
            _this.handlerSignUp(userState);
            RxAVUser.saveCurrentUser(_this);
        });
    };
    RxAVUser.login = function (username, password) {
    };
    RxAVUser.prototype.handlerSignUp = function (userState) {
        _super.prototype.handlerSave.call(this, userState);
        this.state.serverData = userState.serverData;
        console.log(this.state);
    };
    return RxAVUser;
}(RxAVObject_1.RxAVObject));
exports.RxAVUser = RxAVUser;
