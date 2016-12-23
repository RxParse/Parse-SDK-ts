"use strict";
var SDKPlugins_1 = require('../internal/SDKPlugins');
var AVCommand_1 = require('../internal/command/AVCommand');
var currentConfig = {};
/**
 * SDK 核心类，包含了基础的功能模块
 *
 * @export
 * @class RxAVClient
 */
var RxAVClient = (function () {
    function RxAVClient() {
    }
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
        RxAVClient.printWelcome();
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
                RxAVClient._headers['User-Agent'] = 'ts-sdk/' + config.sdkVersion;
            }
        }
        return RxAVClient._headers;
    };
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
