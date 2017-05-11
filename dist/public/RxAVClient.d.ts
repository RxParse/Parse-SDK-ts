import { AVCommand } from '../internal/command/AVCommand';
import { IStorage } from '../internal/storage/IStorage';
import { IDeviceInfo } from '../internal/analytics/IDeviceInfo';
import { IWebSocketClient } from '../internal/websocket/IWebSocketClient';
import { Observable } from 'rxjs';
/**
 * SDK 核心类，包含了基础的功能模块
 *
 * @export
 * @class RxAVClient
 */
export declare class RxAVClient {
    /**
     * 初始化 SDK
     *
     * @static
     * @param {any}
     * {{
     *         appId: string,
     *         appKey: string,
     *         region?: string,
     *         serverUrl?: string,
     *         log?: boolean,
     *         pluginVersion?: number,
     *         plugins?: {
     *             storage?: IStorage,
     *             device?: IDeviceInfo
     *         }
     *     }} config
     *
     * @memberOf RxAVClient
     */
    static init(config: {
        appId?: string;
        appKey?: string;
        region?: string;
        log?: boolean;
        pluginVersion?: number;
        plugins?: {
            storage?: IStorage;
            device?: IDeviceInfo;
            websocket?: IWebSocketClient;
        };
    }): RxAVClient;
    currentApp: RxAVApp;
    remotes: Array<RxAVApp>;
    add(app: RxAVApp, replace?: boolean): RxAVClient;
    switch(shortname: string): RxAVClient;
    headers(): {
        [key: string]: any;
    };
    readonly SDKVersion: string;
    isNode(): boolean;
    static inLeanEngine(): boolean;
    protected printWelcome(): void;
    static printLog(message?: any, ...optionalParams: any[]): void;
    protected static generateAVCommand(relativeUrl: string, method: string, data?: {
        [key: string]: any;
    }, sessionToken?: string, app?: RxAVApp): AVCommand;
    static runCommand(relativeUrl: string, method: string, data?: {
        [key: string]: any;
    }, sessionToken?: string, app?: RxAVApp): Observable<{
        [key: string]: any;
    }>;
    private static _avClientInstance;
    static readonly instance: RxAVClient;
    currentConfiguration: {
        isNode?: boolean;
        sdkVersion?: string;
        log?: boolean;
        pluginVersion?: number;
        runtime?: string;
    };
    initialize(config: {
        appId?: string;
        appKey?: string;
        region?: string;
        log?: boolean;
        pluginVersion?: number;
        plugins?: {
            storage?: IStorage;
            device?: IDeviceInfo;
            websocket?: IWebSocketClient;
        };
    }): RxAVClient;
    request(url: string, method?: string, headers?: {
        [key: string]: any;
    }, data?: {
        [key: string]: any;
    }): Observable<{
        [key: string]: any;
    }>;
}
export declare class AppRouterState {
    constructor(appId: string);
    TTL: number;
    ApiServer: string;
    EngineServer: string;
    PushServer: string;
    RealtimeRouterServer: string;
    StatsServer: string;
    Source: string;
    FetchedAt: Date;
}
export declare class RxAVApp {
    constructor(options: {
        appId: string;
        appKey: string;
        region?: string;
        shortname?: string;
        server?: {
            api?: string;
            realtimeRouter?: string;
            rtm?: string;
            push?: string;
            stats?: string;
            engine?: string;
        };
        additionalHeaders?: {
            [key: string]: any;
        };
    });
    shortname: string;
    appId: string;
    appKey: string;
    region?: string;
    additionalHeaders?: {
        [key: string]: any;
    };
    appRouterState: AppRouterState;
    server?: {
        api?: string;
        realtimeRouter?: string;
        rtm?: string;
        push?: string;
        stats?: string;
        engine?: string;
    };
    readonly api: any;
    readonly rtm: any;
    readonly realtimeRouter: any;
    readonly engine: any;
    readonly stats: any;
    readonly push: any;
    readonly httpHeaders: {
        [key: string]: any;
    };
    private _getUrl(key);
}
