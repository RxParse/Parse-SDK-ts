import { Observable } from 'rxjs';
import { RxParseClient, RxParseObject } from 'RxParse';
import { SDKPlugins } from '../internal/SDKPlugins';
import { IObjectState } from '../internal/object/state/IObjectState';
import * as jstz from 'jstz';

/**
 * 安装数据
 * 
 * @export
 * @class RxAVInstallation
 * @extends {RxParseObject}
 */
export class RxAVInstallation extends RxParseObject {
    static readonly installationCacheKey = 'CurrentInstallation';
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
    set channels(data: Array<string>) {
        this.set('channels', data);
    }
    get badge() {
        return this.get('badge');
    }
    set badge(data: number) {
        this.set('badge', data);
    }
    get deviceType() {
        return this.get('deviceType');
    }
    set deviceType(data: string) {
        this.set('deviceType', data);
    }
    get deviceToken() {
        return this.get('deviceToken');
    }
    set deviceToken(data: string) {
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

    set installationId(value: string) {
        this.set('installationId', value);
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

    constructor() {
        super('_Installation');
        this.set('timeZone', this.timeZone);
    }

    /**
     * 保存当前的 {RxAVInstallation} 到云端
     * 
     * @returns {Observable<boolean>} 
     * 
     * @memberOf RxAVInstallation
     */
    save(): Observable<boolean> {
        return super.save().flatMap(s1 => {
            if (s1)
                return RxAVInstallation.saveCurrentInstallation(this);
            else return Observable.from([false]);
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
    public static current(): Observable<RxAVInstallation> {
        if (SDKPlugins.instance.hasStorage) {
            return SDKPlugins.instance.LocalStorageControllerInstance.get(RxAVInstallation.installationCacheKey).map(installationCache => {
                if (installationCache) {
                    let installationState = SDKPlugins.instance.ObjectDecoder.decode(installationCache, SDKPlugins.instance.Decoder);
                    installationState = installationState.mutatedClone((s: IObjectState) => { });
                    let installation = RxParseObject.createSubclass(RxAVInstallation, '');
                    installation.handleFetchResult(installationState);
                    RxAVInstallation._currentInstallation = installation;
                }
                return RxAVInstallation._currentInstallation;
            });
        }
        return Observable.from([RxAVInstallation._currentInstallation]);
    }
    
    /**
     *  在调用本方法之前，请务必确保你已经调用了 RxAVInstallation.current()
     * 
     * @readonly
     * @static
     * 
     * @memberOf RxAVInstallation
     */
    public static get currentInstallation() {
        return RxAVInstallation._currentInstallation;
    }
    private static _currentInstallation: RxAVInstallation;
    static saveCurrentInstallation(installation: RxAVInstallation) {
        RxAVInstallation._currentInstallation = installation;
        return RxParseObject.saveToLocalStorage(installation, RxAVInstallation.installationCacheKey);
    }
}