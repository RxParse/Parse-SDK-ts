"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var rxjs_1 = require('rxjs');
var RxLeanCloud_1 = require('../RxLeanCloud');
var SDKPlugins_1 = require('../internal/SDKPlugins');
var jstz = require('jstz');
/**
 * 安装数据
 *
 * @export
 * @class RxAVInstallation
 * @extends {RxAVObject}
 */
var RxAVInstallation = (function (_super) {
    __extends(RxAVInstallation, _super);
    function RxAVInstallation() {
        _super.call(this, '_Installation');
        this.set('timeZone', this.timeZone);
    }
    Object.defineProperty(RxAVInstallation.prototype, "channels", {
        get: function () {
            return this.get('channels');
        },
        set: function (data) {
            this.set('channels', data);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(RxAVInstallation.prototype, "badge", {
        get: function () {
            return this.get('badge');
        },
        set: function (data) {
            this.set('badge', data);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(RxAVInstallation.prototype, "deviceType", {
        get: function () {
            return this.get('deviceType');
        },
        set: function (data) {
            this.set('deviceType', data);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(RxAVInstallation.prototype, "deviceToken", {
        get: function () {
            return this.get('deviceToken');
        },
        set: function (data) {
            this.set('deviceToken', data);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(RxAVInstallation.prototype, "installationId", {
        get: function () {
            return this.get('installationId');
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(RxAVInstallation.prototype, "timeZone", {
        get: function () {
            return jstz.determine().name();
        },
        enumerable: true,
        configurable: true
    });
    RxAVInstallation.prototype.save = function () {
        var _this = this;
        return _super.prototype.save.call(this).flatMap(function (s1) {
            if (s1)
                return RxAVInstallation.saveCurrentInstallation(_this);
            else
                return rxjs_1.Observable.from([false]);
        });
    };
    RxAVInstallation.current = function () {
        return SDKPlugins_1.SDKPlugins.instance.LocalStorageControllerInstance.get(RxAVInstallation.installationCacheKey).map(function (installationCache) {
            if (installationCache) {
                var installationState = SDKPlugins_1.SDKPlugins.instance.ObjectDecoder.decode(installationCache, SDKPlugins_1.SDKPlugins.instance.Decoder);
                installationState = installationState.mutatedClone(function (s) { });
                var installation = RxLeanCloud_1.RxAVObject.createSubclass(RxAVInstallation, '');
                installation.handleFetchResult(installationState);
                RxAVInstallation._currentInstallation = installation;
            }
            return RxAVInstallation._currentInstallation;
        });
    };
    Object.defineProperty(RxAVInstallation, "currentInstallation", {
        get: function () {
            return RxAVInstallation._currentInstallation;
        },
        enumerable: true,
        configurable: true
    });
    RxAVInstallation.saveCurrentInstallation = function (installation) {
        RxAVInstallation._currentInstallation = installation;
        return RxLeanCloud_1.RxAVObject.saveToLocalStorage(installation, RxAVInstallation.installationCacheKey);
    };
    RxAVInstallation.installationCacheKey = 'CurrentInstallation';
    RxAVInstallation._currentInstallation = null;
    return RxAVInstallation;
}(RxLeanCloud_1.RxAVObject));
exports.RxAVInstallation = RxAVInstallation;
