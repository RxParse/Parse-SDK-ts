import { AVCommand } from '../internal/command/AVCommand';
import { IStorage } from '../internal/storage/IStorage';
import { IDeviceInfo } from '../internal/analytics/IDeviceInfo';
import { IRxWebSocketClient } from '../internal/websocket/IRxWebSocketClient';
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
        appId: string;
        appKey: string;
        region?: string;
        serverUrl?: string;
        server?: {
            api?: string;
            pushRouter?: string;
            rtm?: string;
            push?: string;
            stats?: string;
            engine?: string;
        };
        log?: boolean;
        pluginVersion?: number;
        plugins?: {
            storage?: IStorage;
            device?: IDeviceInfo;
            websocket?: IRxWebSocketClient;
        };
    }): void;
    static restoreSettings(): Observable<boolean>;
    protected static _headers: {
        [key: string]: any;
    };
    static headers(): {
        [key: string]: any;
    };
    static readonly sdk_version: string;
    static currentConfig(): {
        applicationId?: string;
        applicationKey?: string;
        server?: {
            api?: string;
            pushRouter?: string;
            rtm?: string;
            push?: string;
            stats?: string;
            engine?: string;
        };
        region?: string;
        isNode?: boolean;
        sdkVersion?: string;
        log?: boolean;
        pluginVersion?: number;
        runtime?: string;
    };
    static isNode(): boolean;
    static inLeanEngine(): boolean;
    protected static printWelcome(): void;
    static printLog(message?: any, ...optionalParams: any[]): void;
    protected static generateAVCommand(relativeUrl: string, method: string, data?: {
        [key: string]: any;
    }, sessionToken?: string): AVCommand;
    static runCommand(relativeUrl: string, method: string, data?: {
        [key: string]: any;
    }, sessionToken?: string): Observable<{
        [key: string]: any;
    }>;
    private static _avClientInstance;
    static readonly instance: RxAVClient;
    appRouterState: AppRouterState;
    currentConfiguration: {
        applicationId?: string;
        applicationKey?: string;
        server?: {
            api?: string;
            pushRouter?: string;
            rtm?: string;
            push?: string;
            stats?: string;
            engine?: string;
        };
        region?: string;
        isNode?: boolean;
        sdkVersion?: string;
        log?: boolean;
        pluginVersion?: number;
        runtime?: string;
    };
    initialize(config: {
        appId: string;
        appKey: string;
        region?: string;
        serverUrl?: string;
        server?: {
            api?: string;
            pushRouter?: string;
            rtm?: string;
            push?: string;
            stats?: string;
            engine?: string;
        };
        log?: boolean;
        pluginVersion?: number;
        plugins?: {
            storage?: IStorage;
            device?: IDeviceInfo;
            websocket?: IRxWebSocketClient;
        };
    }): void;
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
