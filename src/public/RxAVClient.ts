import { SDKPlugins } from '../internal/SDKPlugins';
import { AVCommand } from '../internal/command/AVCommand';
import { AVCommandResponse } from '../internal/command/AVCommandResponse';
import { IAVCommandRunner } from '../internal/command/IAVCommandRunner';
import { AVCommandRunner } from '../internal/command/AVCommandRunner';
import { IStorage } from '../internal/storage/IStorage';
import { IDeviceInfo } from '../internal/analytics/IDeviceInfo';
import { IRxWebSocketClient } from '../internal/websocket/IRxWebSocketClient';
import { IWebSocketClient } from '../internal/websocket/IWebSocketClient';
import { StorageController } from '../internal/storage/controller/StorageController';
import { Observable } from 'rxjs';
import { HttpRequest } from '../internal/httpClient/HttpRequest';
var pjson = require('../package.json');

// var providers: {
//     storage?: IStorage,
//     device?: IDeviceInfo
// } = {};

/**
 * SDK 核心类，包含了基础的功能模块
 * 
 * @export
 * @class RxAVClient
 */
export class RxAVClient {
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
        appId: string,
        appKey: string,
        region?: string,
        server?: {
            api?: string,
            pushRouter?: string,
            rtm?: string,
            push?: string,
            stats?: string,
            engine?: string
        },
        log?: boolean,
        pluginVersion?: number,
        plugins?: {
            storage?: IStorage,
            device?: IDeviceInfo,
            websocket?: IWebSocketClient
        }
    }): void {
        RxAVClient.instance.initialize(config);
    }

    static currentApp: RxAVApp;
    static remotes: Array<RxAVApp> = [];
    static add(app: RxAVApp, replace?: boolean) {
        RxAVClient.remotes.push(app);
        if (replace) {
            RxAVClient.currentApp = app;
        }
    }

    static switch(shortname: string) {
        let tempApp = RxAVClient.remotes.find(app => {
            return app.shortname == shortname;
        });
        if (tempApp) {
            RxAVClient.currentApp = tempApp;
        }
    }

    protected static _headers: { [key: string]: any };
    public static headers() {
        let config = RxAVClient.currentConfig();
        if (RxAVClient._headers == null) {
            RxAVClient._headers = {
                'X-LC-Id': config.applicationId,
                'X-LC-Key': config.applicationKey,
                'Content-Type': 'application/json'
            }
            if (RxAVClient.isNode()) {
                RxAVClient._headers['User-Agent'] = 'ts-sdk/' + pjson.version;
            }
        }
        return RxAVClient._headers;
    }

    public static get sdk_version(): string {
        return pjson.version;
    }

    public get SDKVersion(): string {
        return pjson.version;
    }

    public static currentConfig() {
        if (RxAVClient.instance.currentConfiguration == null) throw new Error('RxAVClient 未被初始化，请调用 RxAVClient.init({appId,appKey}) 进行初始化.');
        return RxAVClient.instance.currentConfiguration;
    }

    public static isNode() {
        return RxAVClient.currentConfig().isNode;
    }

    public static inLeanEngine() {
        return false;
    }

    protected static printWelcome() {
        RxAVClient.printLog('===LeanCloud-Typescript-Rx-SDK=============');
        RxAVClient.printLog(`pluginVersion:${RxAVClient.instance.currentConfiguration.pluginVersion}`);
        RxAVClient.printLog(`environment:node?${RxAVClient.instance.currentConfiguration.isNode}`);
        RxAVClient.printLog(`region:${RxAVClient.instance.currentConfiguration.region}`);
        RxAVClient.printLog('===Rx is great,Typescript is wonderful!====');
    }

    public static printLog(message?: any, ...optionalParams: any[]) {
        if (RxAVClient.currentConfig().log) {
            console.log('===================================');
            if (optionalParams.length > 0)
                console.log(message, optionalParams);
            else console.log(message);
        }
    }

    protected static generateAVCommand(relativeUrl: string, method: string, data?: { [key: string]: any }, sessionToken?: string): AVCommand {
        let cmd = new AVCommand({
            relativeUrl: relativeUrl,
            method: method,
            data: data,
            sessionToken: sessionToken
        });
        return cmd;
    }

    public static runCommand(relativeUrl: string, method: string, data?: { [key: string]: any }, sessionToken?: string): Observable<{ [key: string]: any }> {
        let cmd = RxAVClient.generateAVCommand(relativeUrl, method, data, sessionToken);
        return SDKPlugins.instance.CommandRunner.runRxCommand(cmd).map(res => {
            return res.body;
        });
    }

    private static _avClientInstance: RxAVClient;

    static get instance(): RxAVClient {
        if (RxAVClient._avClientInstance == null)
            RxAVClient._avClientInstance = new RxAVClient();
        return RxAVClient._avClientInstance;
    }

    appRouterState: AppRouterState;
    currentConfiguration: {
        applicationId?: string,
        applicationKey?: string,
        server?: {
            api?: string,
            pushRouter?: string,
            rtm?: string,
            push?: string,
            stats?: string,
            engine?: string
        },
        region?: string,
        isNode?: boolean,
        sdkVersion?: string,
        log?: boolean,
        pluginVersion?: number,
        runtime?: string
    } = {};


    public initialize(config: {
        appId: string,
        appKey: string,
        region?: string,
        serverUrl?: string,
        server?: {
            api?: string,
            pushRouter?: string,
            rtm?: string,
            push?: string,
            stats?: string,
            engine?: string
        },
        log?: boolean,
        pluginVersion?: number,
        plugins?: {
            storage?: IStorage,
            device?: IDeviceInfo,
            websocket?: IWebSocketClient
        }
    }) {
        // 注册全局未捕获异常处理器
        process.on('uncaughtException', function (err) {
            console.error("Caught exception:", err.stack);
        });
        process.on('unhandledRejection', function (reason, p) {
            console.error("Unhandled Rejection at: Promise ", p, " reason: ", reason.stack);
        });
        this.appRouterState = new AppRouterState(config.appId);
        this.currentConfiguration.applicationId = config.appId;
        this.currentConfiguration.applicationKey = config.appKey;
        this.currentConfiguration.log = config.log;

        if (config.server == null) {
            this.currentConfiguration.server = {
                api: 'https://api.leancloud.cn'
            };
        }
        if (config.region == null) {
            config.region = 'cn';
        }

        if (config.region != null) {
            this.currentConfiguration.region = config.region;
            if (config.region.toLowerCase() == 'us') {
                config.server.api = 'https://us-api.leancloud.cn';
            }
        }

        if (config.server != null) {
            this.currentConfiguration.server = config.server;
        }

        if (typeof (process) !== 'undefined' && process.versions && process.versions.node) {
            this.currentConfiguration.isNode = true;
        }

        this.currentConfiguration.log = config.log;
        this.currentConfiguration.pluginVersion = config.pluginVersion;
        SDKPlugins.version = config.pluginVersion;
        if (config.plugins) {
            if (config.plugins.storage) {
                SDKPlugins.instance.StorageProvider = config.plugins.storage;
                SDKPlugins.instance.LocalStorageControllerInstance = new StorageController(config.plugins.storage);
            }
            if (config.plugins.device) {
                SDKPlugins.instance.DeviceProvider = config.plugins.device;
            }
            if (config.plugins.websocket) {
                SDKPlugins.instance.WebSocketProvider = config.plugins.websocket;
            }
        }
        RxAVClient.printWelcome();
    }

    public request(url: string, method?: string, headers?: { [key: string]: any }, data?: { [key: string]: any }): Observable<{ [key: string]: any }> {
        let httpRequest = new HttpRequest();
        httpRequest.url = url;
        httpRequest.method = "GET";
        httpRequest.headers = {};
        if (method)
            httpRequest.method = method;
        if (data)
            httpRequest.data = data;
        if (headers)
            httpRequest.headers = headers;
        return SDKPlugins.instance.HttpClient.execute(httpRequest);
    }
}


export class AppRouterState {
    constructor(appId: string) {
        let appDomain = appId.substring(0, 8).toLowerCase();
        this.TTL = -1;
        let protocol = 'https://';
        let prefix = `${protocol}${appDomain}`;
        this.ApiServer = `${prefix}.api.lncld.net`;
        this.EngineServer = `${prefix}.engine.lncld.net`;
        this.PushServer = `${prefix}.push.lncld.net`;
        this.RealtimeRouterServer = `${prefix}.rtm.lncld.net`;
        this.StatsServer = `${prefix}.stats.lncld.net`;
        this.Source = "initial";
    }
    public TTL: number
    public ApiServer: string;
    public EngineServer: string;
    public PushServer: string;
    public RealtimeRouterServer: string;
    public StatsServer: string;
    public Source: string;
    public FetchedAt: Date;
}

export class RxAVApp {
    shortname: string;
    appId: string;
    appKey: string;
    region?: string;
}