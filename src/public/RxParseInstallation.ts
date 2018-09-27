import { Observable, from } from 'rxjs';
import { RxParseObject } from '../RxParse';
import { SDKPlugins } from '../internal/SDKPlugins';
import { IObjectState } from '../internal/object/state/IObjectState';
import * as jstz from 'jstz';
import { flatMap, map } from 'rxjs/operators';

export class RxParseInstallation extends RxParseObject {
    static readonly installationCacheKey = 'CurrentInstallation';
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

    set installationId(value: string) {
        this.set('installationId', value);
    }

    get timeZone() {
        return jstz.determine().name();
    }

    constructor() {
        super('_Installation');
        this.set('timeZone', this.timeZone);
    }

    save(): Observable<boolean> {
        return super.save().pipe(flatMap(s1 => {
            if (s1)
                return RxParseInstallation.saveCurrentInstallation(this);
            else return from([false]);
        }));
    }

    public static current(): Observable<RxParseInstallation> {
        if (SDKPlugins.instance.hasStorage) {
            return SDKPlugins.instance.LocalStorageControllerInstance.get(RxParseInstallation.installationCacheKey).pipe(map(installationCache => {
                if (installationCache) {
                    let installationState = SDKPlugins.instance.ObjectDecoder.decode(installationCache, SDKPlugins.instance.Decoder);
                    installationState = installationState.mutatedClone((s: IObjectState) => { });
                    let installation = RxParseObject.createSubclass(RxParseInstallation, '');
                    installation.handleFetchResult(installationState);
                    RxParseInstallation._currentInstallation = installation;
                }
                return RxParseInstallation._currentInstallation;
            }));
        }
        return from([RxParseInstallation._currentInstallation]);
    }

    public static get currentInstallation() {
        return RxParseInstallation._currentInstallation;
    }
    private static _currentInstallation: RxParseInstallation;
    static saveCurrentInstallation(installation: RxParseInstallation) {
        RxParseInstallation._currentInstallation = installation;
        return RxParseObject.saveToLocalStorage(installation, RxParseInstallation.installationCacheKey);
    }
}