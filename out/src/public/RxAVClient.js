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
        RxAVClient.instance.initialize(config);
    }
    static restoreSettings() {
        return SDKPlugins_1.SDKPlugins.instance.LocalStorageControllerInstance.load().map(provider => {
            return provider != null;
        });
    }
    static headers() {
        let config = RxAVClient.currentConfig();
        if (RxAVClient._headers == null) {
            RxAVClient._headers = {
                'X-LC-Id': config.applicationId,
                'X-LC-Key': config.applicationKey,
                'Content-Type': 'application/json'
            };
            if (RxAVClient.isNode()) {
                RxAVClient._headers['User-Agent'] = 'ts-sdk/' + pjson.version;
            }
        }
        return RxAVClient._headers;
    }
    static get sdk_version() {
        return pjson.version;
    }
    static currentConfig() {
        if (RxAVClient.instance.currentConfiguration == null)
            throw new Error('RxAVClient 未被初始化，请调用 RxAVClient.init({appId,appKey}) 进行初始化.');
        return RxAVClient.instance.currentConfiguration;
    }
    static isNode() {
        return RxAVClient.currentConfig().isNode;
    }
    static inLeanEngine() {
        return false;
    }
    static printWelcome() {
        RxAVClient.printLog('===LeanCloud-Typescript-Rx-SDK=============');
        RxAVClient.printLog(`pluginVersion:${RxAVClient.instance.currentConfiguration.pluginVersion}`);
        RxAVClient.printLog(`environment:node?${RxAVClient.instance.currentConfiguration.isNode}`);
        RxAVClient.printLog(`region:${RxAVClient.instance.currentConfiguration.region}`);
        RxAVClient.printLog('===Rx is great,Typescript is wonderful!====');
    }
    static printLog(message, ...optionalParams) {
        if (RxAVClient.currentConfig().log) {
            console.log('===================================');
            if (optionalParams.length > 0)
                console.log(message, optionalParams);
            else
                console.log(message);
        }
    }
    static generateAVCommand(relativeUrl, method, data, sessionToken) {
        let cmd = new AVCommand_1.AVCommand({
            relativeUrl: relativeUrl,
            method: method,
            data: data,
            sessionToken: sessionToken
        });
        return cmd;
    }
    static runCommand(relativeUrl, method, data, sessionToken) {
        let cmd = RxAVClient.generateAVCommand(relativeUrl, method, data, sessionToken);
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
        this.appRouterState = new AppRouterState(config.appId);
        this.currentConfiguration.applicationId = config.appId;
        this.currentConfiguration.applicationKey = config.appKey;
        this.currentConfiguration.log = config.log;
        if (config.server == null) {
            this.currentConfiguration.server = {
                api: 'https://api.leancloud.cn/1.1'
            };
        }
        if (config.region == null) {
            config.region = 'cn';
        }
        if (config.region != null) {
            this.currentConfiguration.region = config.region;
            if (config.region.toLowerCase() == 'us') {
                config.server.api = 'https://us-api.leancloud.cn/1.1';
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
        RxAVClient.printWelcome();
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
        let prefix = appId.substring(0, 8).toLowerCase();
        this.TTL = -1;
        this.ApiServer = `${prefix}.api.lncld.net`;
        this.EngineServer = `${prefix}.engine.lncld.net`;
        this.PushServer = `${prefix}.push.lncld.net`;
        this.RealtimeRouterServer = `${prefix}.rtm.lncld.net`;
        this.StatsServer = `${prefix}.stats.lncld.net`;
        this.Source = "initial";
    }
}
exports.AppRouterState = AppRouterState;
