"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const SDKPlugins_1 = require("../internal/SDKPlugins");
const AVCommand_1 = require("../internal/command/AVCommand");
const StorageController_1 = require("../internal/storage/controller/StorageController");
const HttpRequest_1 = require("../internal/httpClient/HttpRequest");
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
class RxAVClient {
    constructor() {
        this.remotes = [];
        this.currentConfiguration = {};
    }
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
    static init(config) {
        return RxAVClient.instance.initialize(config);
    }
    add(app, replace) {
        if (this.remotes.length == 0 || (typeof replace != 'undefined' && replace)) {
            if (app.shortname == null) {
                app.shortname = 'default';
            }
            this.currentApp = app;
        }
        this.remotes.push(app);
        return this;
    }
    take(app, options) {
        if (options) {
            if (options.app) {
                if (options.app instanceof RxAVApp) {
                    app = options.app;
                }
            }
            else if (options.appName) {
                if (typeof options.appName === "string") {
                    let tempApp = this.remotes.find(a => {
                        return a.shortname == options.appName;
                    });
                    if (tempApp) {
                        app = tempApp;
                    }
                }
            }
        }
        else {
            app = RxAVClient.instance.currentApp;
        }
        return app;
    }
    _switch(shortname) {
        let tempApp = this.remotes.find(app => {
            return app.shortname == shortname;
        });
        if (tempApp) {
            this.currentApp = tempApp;
        }
        return this;
    }
    get SDKVersion() {
        return pjson.version;
    }
    isNode() {
        return this.currentConfiguration.isNode;
    }
    static inLeanEngine() {
        return false;
    }
    printWelcome() {
        RxAVClient.printLog('=== LeanCloud-Typescript-Rx-SDK ===');
        RxAVClient.printLog(`pluginVersion:${this.currentConfiguration.pluginVersion}`);
        RxAVClient.printLog(`environment:node?${this.currentConfiguration.isNode}`);
        RxAVClient.printLog(`region:${this.currentApp.region}`);
        RxAVClient.printLog('=== Rx is great, Typescript is wonderful! ===');
    }
    static printLog(message, ...optionalParams) {
        if (RxAVClient.instance.currentConfiguration.log) {
            console.log('===================================');
            if (optionalParams.length > 0)
                console.log(message, optionalParams);
            else
                console.log(message);
        }
    }
    static generateAVCommand(relativeUrl, method, data, sessionToken, app) {
        let cmd = new AVCommand_1.AVCommand({
            app: app,
            relativeUrl: relativeUrl,
            method: method,
            data: data,
            sessionToken: sessionToken
        });
        return cmd;
    }
    static runCommand(relativeUrl, method, data, sessionToken, app) {
        let cmd = RxAVClient.generateAVCommand(relativeUrl, method, data, sessionToken, app);
        return SDKPlugins_1.SDKPlugins.instance.CommandRunner.runRxCommand(cmd).map(res => {
            return res.body;
        });
    }
    static get instance() {
        if (RxAVClient._avClientInstance == null)
            RxAVClient._avClientInstance = new RxAVClient();
        return RxAVClient._avClientInstance;
    }
    initialize(config) {
        // 注册全局未捕获异常处理器
        process.on('uncaughtException', function (err) {
            console.error("Caught exception:", err.stack);
        });
        process.on('unhandledRejection', function (reason, p) {
            console.error("Unhandled Rejection at: Promise ", p, " reason: ", reason.stack);
        });
        this.currentConfiguration.log = config.log;
        if (typeof (process) !== 'undefined' && process.versions && process.versions.node) {
            this.currentConfiguration.isNode = true;
        }
        if (config.appId && config.appKey) {
            let app = new RxAVApp({
                appId: config.appId,
                appKey: config.appKey,
            });
            this.add(app, true);
        }
        this.currentConfiguration.pluginVersion = config.pluginVersion;
        SDKPlugins_1.SDKPlugins.version = config.pluginVersion;
        if (config.plugins) {
            if (config.plugins.storage) {
                SDKPlugins_1.SDKPlugins.instance.StorageProvider = config.plugins.storage;
                SDKPlugins_1.SDKPlugins.instance.LocalStorageControllerInstance = new StorageController_1.StorageController(config.plugins.storage);
            }
            if (config.plugins.device) {
                SDKPlugins_1.SDKPlugins.instance.DeviceProvider = config.plugins.device;
            }
            if (config.plugins.websocket) {
                SDKPlugins_1.SDKPlugins.instance.WebSocketProvider = config.plugins.websocket;
            }
        }
        return this;
    }
    request(url, method, headers, data) {
        let httpRequest = new HttpRequest_1.HttpRequest();
        httpRequest.url = url;
        httpRequest.method = "GET";
        httpRequest.headers = {};
        if (method)
            httpRequest.method = method;
        if (data)
            httpRequest.data = data;
        if (headers)
            httpRequest.headers = headers;
        return SDKPlugins_1.SDKPlugins.instance.HttpClient.execute(httpRequest);
    }
}
exports.RxAVClient = RxAVClient;
class AppRouterState {
    constructor(appId) {
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
}
exports.AppRouterState = AppRouterState;
class RxAVApp {
    constructor(options) {
        this.appId = options.appId;
        this.appKey = options.appKey;
        if (options.region)
            this.region = options.region;
        else
            this.region = 'cn';
        this.server = options.server;
        this.shortname = options.shortname;
        this.additionalHeaders = options.additionalHeaders;
        this.appRouterState = new AppRouterState(this.appId);
    }
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
        let headers = {};
        headers = {
            'X-LC-Id': this.appId,
            'X-LC-Key': this.appKey,
            'Content-Type': 'application/json'
        };
        if (RxAVClient.instance.isNode()) {
            headers['User-Agent'] = 'ts-sdk/' + pjson.version;
        }
        if (this.additionalHeaders) {
            for (let key in this.additionalHeaders) {
                headers[key] = this.additionalHeaders[key];
            }
        }
        return headers;
    }
    _getUrl(key) {
        if (this.server) {
            if (Object.prototype.hasOwnProperty.call(this.server, key)) {
                return this.server[key];
            }
        }
        return null;
    }
}
exports.RxAVApp = RxAVApp;
