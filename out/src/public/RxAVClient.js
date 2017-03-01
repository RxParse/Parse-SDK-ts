"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var SDKPlugins_1 = require("../internal/SDKPlugins");
var AVCommand_1 = require("../internal/command/AVCommand");
var StorageController_1 = require("../internal/storage/controller/StorageController");
var pjson = require('../package.json');
var currentConfig = {};
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
        currentConfig.applicationId = config.appId;
        currentConfig.applicationKey = config.appKey;
        currentConfig.log = config.log;
        currentConfig.region = 'cn';
        currentConfig.serverUrl = 'https://api.leancloud.cn/1.1';
        if (config.region != null) {
            currentConfig.region = config.region;
            if (currentConfig.region.toLowerCase() == 'us') {
                currentConfig.serverUrl = 'https://us-api.leancloud.cn/1.1';
            }
        }
        currentConfig.serverUrl = config.serverUrl != null ? config.serverUrl : currentConfig.serverUrl;
        if (typeof (process) !== 'undefined' && process.versions && process.versions.node) {
            currentConfig.isNode = true;
        }
        currentConfig.log = config.log;
        currentConfig.pluginVersion = config.pluginVersion;
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
        return currentConfig.serverUrl;
    };
    RxAVClient.currentConfig = function () {
        if (currentConfig.serverUrl == null)
            throw new Error('RxAVClient 未被初始化，请调用 RxAVClient.init({appId,appKey}) 进行初始化.');
        return currentConfig;
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
        RxAVClient.printLog("pluginVersion:" + currentConfig.pluginVersion);
        RxAVClient.printLog("environment:node?" + currentConfig.isNode);
        RxAVClient.printLog("region:" + currentConfig.region);
        RxAVClient.printLog("server url:" + currentConfig.serverUrl);
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
    RxAVClient.request = function (relativeUrl, method, data, sessionToken) {
        var cmd = RxAVClient.generateAVCommand(relativeUrl, method, data, sessionToken);
        return SDKPlugins_1.SDKPlugins.instance.CommandRunner.runRxCommand(cmd).map(function (res) {
            return res.body;
        });
    };
    return RxAVClient;
}());
exports.RxAVClient = RxAVClient;
