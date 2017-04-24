"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var SDKPlugins_1 = require("../internal/SDKPlugins");
var AVCommand_1 = require("../internal/command/AVCommand");
var StorageController_1 = require("../internal/storage/controller/StorageController");
var HttpRequest_1 = require("../internal/httpClient/HttpRequest");
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
var RxAVClient = (function () {
    function RxAVClient() {
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
    RxAVClient.init = function (config) {
        RxAVClient.instance.initialize(config);
    };
    RxAVClient.restoreSettings = function () {
        return SDKPlugins_1.SDKPlugins.instance.LocalStorageControllerInstance.load().map(function (provider) {
            return provider != null;
        });
    };
    RxAVClient.headers = function () {
        var config = RxAVClient.currentConfig();
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
    };
    Object.defineProperty(RxAVClient, "sdk_version", {
        get: function () {
            return pjson.version;
        },
        enumerable: true,
        configurable: true
    });
    RxAVClient.serverUrl = function () {
        return RxAVClient.instance.currentConfiguration.serverUrl;
    };
    RxAVClient.currentConfig = function () {
        if (RxAVClient.instance.currentConfiguration.serverUrl == null)
            throw new Error('RxAVClient 未被初始化，请调用 RxAVClient.init({appId,appKey}) 进行初始化.');
        return RxAVClient.instance.currentConfiguration;
    };
    RxAVClient.isNode = function () {
        return RxAVClient.currentConfig().isNode;
    };
    RxAVClient.inLeanEngine = function () {
        return false;
    };
    RxAVClient.printWelcome = function () {
        RxAVClient.printLog('===LeanCloud-Typescript-Rx-SDK=============');
        // RxAVClient.printLog(`version:${currentConfig.sdkVersion}`);
        RxAVClient.printLog("pluginVersion:" + RxAVClient.instance.currentConfiguration.pluginVersion);
        RxAVClient.printLog("environment:node?" + RxAVClient.instance.currentConfiguration.isNode);
        RxAVClient.printLog("region:" + RxAVClient.instance.currentConfiguration.region);
        RxAVClient.printLog("server url:" + RxAVClient.instance.currentConfiguration.serverUrl);
        RxAVClient.printLog('===Rx is great,Typescript is wonderful!====');
    };
    RxAVClient.printLog = function (message) {
        var optionalParams = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            optionalParams[_i - 1] = arguments[_i];
        }
        if (RxAVClient.currentConfig().log) {
            console.log('===================================');
            if (optionalParams.length > 0)
                console.log(message, optionalParams);
            else
                console.log(message);
        }
    };
    RxAVClient.generateAVCommand = function (relativeUrl, method, data, sessionToken) {
        var cmd = new AVCommand_1.AVCommand({
            relativeUrl: relativeUrl,
            method: method,
            data: data,
            sessionToken: sessionToken
        });
        return cmd;
    };
    RxAVClient.runCommand = function (relativeUrl, method, data, sessionToken) {
        var cmd = RxAVClient.generateAVCommand(relativeUrl, method, data, sessionToken);
        return SDKPlugins_1.SDKPlugins.instance.CommandRunner.runRxCommand(cmd).map(function (res) {
            return res.body;
        });
    };
    Object.defineProperty(RxAVClient, "instance", {
        get: function () {
            if (RxAVClient._avClientInstance == null)
                RxAVClient._avClientInstance = new RxAVClient();
            return RxAVClient._avClientInstance;
        },
        enumerable: true,
        configurable: true
    });
    RxAVClient.prototype.initialize = function (config) {
        this.appRouterState = new AppRouterState(config.appId);
        this.currentConfiguration.applicationId = config.appId;
        this.currentConfiguration.applicationKey = config.appKey;
        this.currentConfiguration.log = config.log;
        this.currentConfiguration.region = 'cn';
        this.currentConfiguration.serverUrl = 'https://api.leancloud.cn/1.1';
        if (config.region != null) {
            this.currentConfiguration.region = config.region;
            if (this.currentConfiguration.region.toLowerCase() == 'us') {
                this.currentConfiguration.serverUrl = 'https://us-api.leancloud.cn/1.1';
            }
        }
        this.currentConfiguration.serverUrl = config.serverUrl != null ? config.serverUrl : this.currentConfiguration.serverUrl;
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
        }
        RxAVClient.printWelcome();
    };
    RxAVClient.prototype.request = function (url, method, headers, data) {
        var httpRequest = new HttpRequest_1.HttpRequest();
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
    };
    return RxAVClient;
}());
exports.RxAVClient = RxAVClient;
var AppRouterState = (function () {
    function AppRouterState(appId) {
        var prefix = appId.substring(0, 8).toLowerCase();
        this.TTL = -1;
        this.ApiServer = prefix + ".api.lncld.net";
        this.EngineServer = prefix + ".engine.lncld.net";
        this.PushServer = prefix + ".push.lncld.net";
        this.RealtimeRouterServer = prefix + ".rtm.lncld.net";
        this.StatsServer = prefix + ".stats.lncld.net";
        this.Source = "initial";
    }
    return AppRouterState;
}());
exports.AppRouterState = AppRouterState;
