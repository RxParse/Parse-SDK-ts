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
import { HttpResponse } from '../internal/httpClient/HttpResponse';
var sdkInfo = require('../package.json');

export class RxParseClient {
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
    static init(config?: {
        appId?: string,
        appKey?: string,
        region?: string,
        log?: boolean,
        pluginVersion?: number,
        plugins?: {
            storage?: IStorage,
            device?: IDeviceInfo,
            websocket?: IWebSocketClient
        }
    }): RxParseClient {
        return RxParseClient.instance.initialize(config);
    }

    /*
    *  
    */
    currentApp: ParseApp;
    remotes: Array<ParseApp> = [];
    add(app: ParseApp, replace?: boolean) {
        if (this.remotes.length == 0 || (typeof replace != 'undefined' && replace)) {
            if (app.shortname == null) {
                app.shortname = 'default';
            }
            this.currentApp = app;
        }
        this.remotes.push(app);
        this.printWelcome(app);
        return this as RxParseClient;
    }

    take(options?: any) {
        let app: ParseApp = null;
        if (!options) {
            return RxParseClient.instance.currentApp;
        } else {
            if (options.app) {
                if (options.app instanceof ParseApp) {
                    app = options.app;
                }
            } else if (options.appName) {
                if (typeof options.appName === "string") {
                    let tempApp = this.remotes.find(a => {
                        return a.shortname == options.appName;
                    });
                    if (tempApp) {
                        app = tempApp;
                    }
                }
            } else {
                app = RxParseClient.instance.currentApp;
            }
        }
        return app;
    }

    private _switch(shortname: string) {
        let tempApp = this.remotes.find(app => {
            return app.shortname == shortname;
        });
        if (tempApp) {
            this.currentApp = tempApp;
        }
        return this as RxParseClient;
    }


    public get SDKVersion(): string {
        return sdkInfo.version;
    }

    public isNode() {
        return this.currentConfiguration.isNode;
    }

    public static inLeanEngine() {
        return false;
    }

    protected printWelcome(app: ParseApp) {
        RxParseClient.printLog('=== LeanCloud-Typescript-Rx-SDK ===');
        RxParseClient.printLog(`pluginVersion:${this.currentConfiguration.pluginVersion}`);
        RxParseClient.printLog(`environment:node?${this.currentConfiguration.isNode}`);
        RxParseClient.printLog(`appId:${app.appId}`);
        RxParseClient.printLog(`appKey:${app.appKey}`);
        RxParseClient.printLog(`region:${app.region}`);
        RxParseClient.printLog('=== Rx is great, Typescript is wonderful! ===');
    }

    public static printHttpLog(request: HttpRequest, response: HttpResponse) {
        RxParseClient.printLog("===HTTP-START===");
        RxParseClient.printLog("===Request-START===");
        RxParseClient.printLog("Url: ", request.url);
        RxParseClient.printLog("Method: ", request.method);
        RxParseClient.printLog("Headers: ", request.headers);
        RxParseClient.printLog("RequestBody(UTF8String): " + request.data);
        RxParseClient.printLog("===Request-END===");
        RxParseClient.printLog("===Response-START===");
        RxParseClient.printLog("StatusCode: ", response.statusCode);
        RxParseClient.printLog("ResponseBody: ", response.body);
        RxParseClient.printLog("===Response-END===");
        RxParseClient.printLog("===HTTP-END===");
    }

    public static printLog(message?: any, ...optionalParams: any[]) {
        if (RxParseClient.instance.currentConfiguration.log) {
            if (optionalParams.length > 0)
                console.log(message, optionalParams);
            else console.log(message);
        }
    }

    protected static generateAVCommand(relativeUrl: string, method: string, data?: { [key: string]: any }, sessionToken?: string, app?: ParseApp): AVCommand {
        let cmd = new AVCommand({
            app: app,
            relativeUrl: relativeUrl,
            method: method,
            data: data,
            sessionToken: sessionToken
        });
        return cmd;
    }

    public rxRunCommandSuccess(relativeUrl: string, method: string, data?: { [key: string]: any }) {
        let cmd = RxParseClient.generateAVCommand(relativeUrl, method, data);
        return SDKPlugins.instance.CommandRunner.runRxCommand(cmd).map(res => {
            return res.statusCode == 200;
        });
    }

    public static runCommand(relativeUrl: string, method: string, data?: { [key: string]: any }, sessionToken?: string, app?: ParseApp): Observable<{ [key: string]: any }> {
        let cmd = RxParseClient.generateAVCommand(relativeUrl, method, data, sessionToken, app);
        return SDKPlugins.instance.CommandRunner.runRxCommand(cmd).map(res => {
            return res.body;
        });
    }

    private static _avClientInstance: RxParseClient;

    /**
     * 
     * 
     * @readonly
     * @static
     * @type {RxParseClient}
     * @memberof RxAVClient
     */
    static get instance(): RxParseClient {
        if (RxParseClient._avClientInstance == null)
            RxParseClient._avClientInstance = new RxParseClient();
        return RxParseClient._avClientInstance;
    }

    currentConfiguration: {
        isNode?: boolean,
        sdkVersion?: string,
        log?: boolean,
        pluginVersion?: number,
        runtime?: string
    } = {};

    /**
     * 
     * 
     * @param {{
     *         appId?: string,
     *         appKey?: string,
     *         region?: string,
     *         log?: boolean,
     *         pluginVersion?: number,
     *         plugins?: {
     *             storage?: IStorage,
     *             device?: IDeviceInfo,
     *             websocket?: IWebSocketClient
     *         }
     *     }} config 
     * @returns 
     * @memberof RxAVClient
     */
    public initialize(config: {
        appId?: string,
        appKey?: string,
        region?: string,
        log?: boolean,
        pluginVersion?: number,
        plugins?: {
            storage?: IStorage,
            device?: IDeviceInfo,
            websocket?: IWebSocketClient
        }
    }) {
        
        process.on('uncaughtException', function (err) {
            console.error("Caught exception:", err.stack);
        });
        process.on('unhandledRejection', function (reason, p) {
            console.error("Unhandled Rejection at: Promise ", p, " reason: ", reason.stack);
        });

        if (typeof (process) !== 'undefined' && process.versions && process.versions.node) {
            this.currentConfiguration.isNode = true;
        }
        if (typeof config != 'undefined') {
            this.currentConfiguration.log = config.log;

            if (config.appId && config.appKey) {
                let app = new ParseApp({
                    appId: config.appId,
                    appKey: config.appKey,
                });

                this.add(app, true);
            }

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
        }

        return this as RxParseClient;
    }

    /**
     * 
     * 
     * @param {string} url 
     * @param {string} [method] 
     * @param {{ [key: string]: any }} [headers] 
     * @param {{ [key: string]: any }} [data] 
     * @returns {Observable<{ [key: string]: any }>} 
     * @memberof RxAVClient
     */
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

        let appHash = appId.split('-');
        if (appHash.length > 1) {
            let regionHash = appHash[1];
            if (regionHash == '9Nh9j0Va') {
                this.ApiServer = `${protocol}e1-api.leancloud.cn`;
                this.EngineServer = `${protocol}e1-api.leancloud.cn`;
                this.PushServer = `${protocol}e1-api.leancloud.cn`;
                this.RealtimeRouterServer = `${protocol}router-q0-push.leancloud.cn`;
                this.StatsServer = `${protocol}e1-api.leancloud.cn`;
            }
        }
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

/**
 * 
 * 
 * @export
 * @class RxAVApp
 */
export class ParseApp {

    constructor(options: {
        appId: string,
        appKey: string,
        region?: string,
        shortname?: string,
        server?: {
            api?: string,
            realtimeRouter?: string,
            rtm?: string,
            push?: string,
            stats?: string,
            engine?: string
        },
        additionalHeaders?: { [key: string]: any };
    }) {
        this.appId = options.appId;
        this.appKey = options.appKey;

        if (options.region)
            this.region = options.region;
        else this.region = 'cn';

        this.server = options.server;
        this.shortname = options.shortname;
        this.additionalHeaders = options.additionalHeaders;

        this.appRouterState = new AppRouterState(this.appId);
    }
    shortname: string;
    appId: string;
    appKey: string;
    region?: string;
    additionalHeaders?: { [key: string]: any };
    appRouterState: AppRouterState;

    server?: {
        api?: string,
        realtimeRouter?: string,
        rtm?: string,
        push?: string,
        stats?: string,
        engine?: string
    };

    get api() {
        let root = this.region == 'cn' ? 'https://api.leancloud.cn' : 'https://us-api.leancloud.cn';
        let url = this._getUrl('api');
        return url || this.appRouterState.ApiServer || root;
    }

    get rtm() {
        let url = this._getUrl('rtm');
        return url;
    }

    get realtimeRouter() {
        let url = this._getUrl('pushRouter');
        return url || this.appRouterState.RealtimeRouterServer;
    }

    get engine() {
        let url = this._getUrl('engine');
        return url || this.appRouterState.EngineServer;
    }

    get stats() {
        let url = this._getUrl('stats');
        return url || this.appRouterState.StatsServer;
    }

    get push() {
        let url = this._getUrl('push');
        return url || this.appRouterState.PushServer;
    }

    get httpHeaders() {
        let headers: { [key: string]: any } = {};
        headers = {
            'X-LC-Id': this.appId,
            'X-LC-Key': this.appKey,
            'Content-Type': 'application/json;charset=utf-8'
        };
        if (RxParseClient.instance.isNode()) {
            headers['User-Agent'] = 'ts-sdk/' + sdkInfo.version;
        }
        if (this.additionalHeaders) {
            for (let key in this.additionalHeaders) {
                headers[key] = this.additionalHeaders[key];
            }
        }
        return headers;
    }

    private _getUrl(key: string) {
        if (this.server) {
            if (Object.prototype.hasOwnProperty.call(this.server, key)) {
                return this.server[key];
            }
        }
        return null;
    }
}
