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
    channels: Array<string>;
    badge: number;
    deviceType: string;
    deviceToken: string;
    readonly installationId: any;
    readonly timeZone: any;
    constructor();
    save(): Observable<boolean>;
    static current(): Observable<RxAVInstallation>;
    static readonly currentInstallation: RxAVInstallation;
    private static _currentInstallation;
    protected static saveCurrentInstallation(installation: RxAVInstallation): Observable<boolean>;
}
