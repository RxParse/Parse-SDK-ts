import { Observable } from 'rxjs';
import { RxAVClient, RxAVObject } from '../RxLeanCloud';
import { SDKPlugins } from '../internal/SDKPlugins';
import { IObjectState } from '../internal/object/state/IObjectState';
import * as jstz from 'jstz';

/**
 * 安装数据
 * 
 * @export
 * @class RxAVInstallation
 * @extends {RxAVObject}
 */
export class RxAVInstallation extends RxAVObject {
    static readonly  installationCacheKey = 'CurrentInstallation';
    get channels() {
        return this.get('channels');
    }
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

    get installationId() {
        return this.get('installationId');
    }

    get timeZone() {
        return jstz.determine().name();
    }

    constructor() {
        super('_Installation');
        this.set('timeZone', this.timeZone);
    }
    save(): Observable<boolean> {
        return super.save().flatMap(s1 => {
            if (s1)
                return RxAVInstallation.saveCurrentInstallation(this);
            else return Observable.from([false]);
        });
    }
    static current(): Observable<RxAVInstallation> {
        return SDKPlugins.instance.LocalStorageControllerInstance.get(RxAVInstallation.installationCacheKey).map(installationCache => {
            if (installationCache) {
                let installationState = SDKPlugins.instance.ObjectDecoder.decode(installationCache, SDKPlugins.instance.Decoder);
                installationState = installationState.mutatedClone((s: IObjectState) => { });
                let installation = RxAVObject.createSubclass(RxAVInstallation, '');
                installation.handleFetchResult(installationState);
                RxAVInstallation._currentInstallation = installation;
            }
            return RxAVInstallation._currentInstallation;
        });
    }
    static get currentInstallation() {
        return RxAVInstallation._currentInstallation;
    }
    private static _currentInstallation: RxAVInstallation = null
    protected static saveCurrentInstallation(installation: RxAVInstallation) {
        RxAVInstallation._currentInstallation = installation;
        return RxAVObject.saveToLocalStorage(installation, RxAVInstallation.installationCacheKey);
    }
}