import { Observable } from 'rxjs';
import { RxAVObject } from '../RxLeanCloud';
/**
 * 安装数据
 *
 * @export
 * @class RxAVInstallation
 * @extends {RxAVObject}
 */
export declare class RxAVInstallation extends RxAVObject {
    static readonly installationCacheKey: string;
    /**
     * 获取频道
     *
     *
     * @memberOf RxAVInstallation
     */
    /**
     * 设置频道
     *
     *
     * @memberOf RxAVInstallation
     */
    channels: Array<string>;
    badge: number;
    deviceType: string;
    deviceToken: string;
    /**
     * 获取 installationId
     *
     * @readonly
     *
     * @memberOf RxAVInstallation
     */
    readonly installationId: any;
    /**
     * 获取设备所在的地区/时区
     *
     * @readonly
     *
     * @memberOf RxAVInstallation
     */
    readonly timeZone: any;
    constructor();
    /**
     * 保存当前的 {RxAVInstallation} 到云端
     *
     * @returns {Observable<boolean>}
     *
     * @memberOf RxAVInstallation
     */
    save(): Observable<boolean>;
    /**
     * 获取当前的 RxAVInstallation 对象
     *
     * @static
     * @returns {Observable<RxAVInstallation>} 异步操作可能会失败
     *
     * @memberOf RxAVInstallation
     */
    static current(): Observable<RxAVInstallation>;
    /**
     *  在调用本方法之前，请务必确保你已经调用了 RxAVInstallation.current()
     *
     * @readonly
     * @static
     *
     * @memberOf RxAVInstallation
     */
    static readonly currentInstallation: RxAVInstallation;
    private static _currentInstallation;
    protected static saveCurrentInstallation(installation: RxAVInstallation): Observable<boolean>;
}
