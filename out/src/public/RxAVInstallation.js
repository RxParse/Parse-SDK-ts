"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const rxjs_1 = require("rxjs");
const RxLeanCloud_1 = require("../RxLeanCloud");
const SDKPlugins_1 = require("../internal/SDKPlugins");
const jstz = require("jstz");
/**
 * 安装数据
 *
 * @export
 * @class RxAVInstallation
 * @extends {RxAVObject}
 */
class RxAVInstallation extends RxLeanCloud_1.RxAVObject {
    constructor() {
        super('_Installation');
        this.set('timeZone', this.timeZone);
    }
    /**
     * 获取频道
     *
     *
     * @memberOf RxAVInstallation
     */
    get channels() {
        return this.get('channels');
    }
    /**
     * 设置频道
     *
     *
     * @memberOf RxAVInstallation
     */
    set channels(data) {
        this.set('channels', data);
    }
    get badge() {
        return this.get('badge');
    }
    set badge(data) {
        this.set('badge', data);
    }
    get deviceType() {
        return this.get('deviceType');
    }
    set deviceType(data) {
        this.set('deviceType', data);
    }
    get deviceToken() {
        return this.get('deviceToken');
    }
    set deviceToken(data) {
        this.set('deviceToken', data);
    }
    /**
     * 获取 installationId
     *
     * @readonly
     *
     * @memberOf RxAVInstallation
     */
    get installationId() {
        return this.get('installationId');
    }
    /**
     * 获取设备所在的地区/时区
     *
     * @readonly
     *
     * @memberOf RxAVInstallation
     */
    get timeZone() {
        return jstz.determine().name();
    }
    /**
     * 保存当前的 {RxAVInstallation} 到云端
     *
     * @returns {Observable<boolean>}
     *
     * @memberOf RxAVInstallation
     */
    save() {
        return super.save().flatMap(s1 => {
            if (s1)
                return RxAVInstallation.saveCurrentInstallation(this);
            else
                return rxjs_1.Observable.from([false]);
        });
    }
    /**
     * 获取当前的 RxAVInstallation 对象
     *
     * @static
     * @returns {Observable<RxAVInstallation>} 异步操作可能会失败
     *
     * @memberOf RxAVInstallation
     */
    static current() {
        return SDKPlugins_1.SDKPlugins.instance.LocalStorageControllerInstance.get(RxAVInstallation.installationCacheKey).map(installationCache => {
            if (installationCache) {
                let installationState = SDKPlugins_1.SDKPlugins.instance.ObjectDecoder.decode(installationCache, SDKPlugins_1.SDKPlugins.instance.Decoder);
                installationState = installationState.mutatedClone((s) => { });
                let installation = RxLeanCloud_1.RxAVObject.createSubclass(RxAVInstallation, '');
                installation.handleFetchResult(installationState);
                RxAVInstallation._currentInstallation = installation;
            }
            return RxAVInstallation._currentInstallation;
        });
    }
    /**
     *  在调用本方法之前，请务必确保你已经调用了 RxAVInstallation.current()
     *
     * @readonly
     * @static
     *
     * @memberOf RxAVInstallation
     */
    static get currentInstallation() {
        return RxAVInstallation._currentInstallation;
    }
    static saveCurrentInstallation(installation) {
        RxAVInstallation._currentInstallation = installation;
        return RxLeanCloud_1.RxAVObject.saveToLocalStorage(installation, RxAVInstallation.installationCacheKey);
    }
}
RxAVInstallation.installationCacheKey = 'CurrentInstallation';
RxAVInstallation._currentInstallation = null;
exports.RxAVInstallation = RxAVInstallation;
