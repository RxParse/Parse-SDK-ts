"use strict";
var SDKPlugins_1 = require('../internal/SDKPlugins');
var currentConfig = {};
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
        currentConfig.sdkVersion = '0.0.1';
        currentConfig.log = config.log;
        currentConfig.pluginVersion = config.pluginVersion;
        SDKPlugins_1.SDKPlugins.version = config.pluginVersion;
        RxAVClient.printWelcome();
    };
    RxAVClient.headers = function () {
        if (RxAVClient._headers == null)
            RxAVClient._headers = {
                'X-LC-Id': currentConfig.applicationId,
                'X-LC-Key': currentConfig.applicationKey,
                'Content-Type': 'application/json',
                'User-Agent': 'ts-sdk/' + currentConfig.sdkVersion
            };
        return RxAVClient._headers;
    };
    RxAVClient.serverUrl = function () {
        return currentConfig.serverUrl;
    };
    RxAVClient.currentConfig = function () {
        return currentConfig;
    };
    RxAVClient.isNode = function () {
        return RxAVClient.currentConfig().isNode;
    };
    RxAVClient.printLog = function (message) {
        var optionalParams = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            optionalParams[_i - 1] = arguments[_i];
        }
        if (RxAVClient.currentConfig().log)
            if (optionalParams.length > 0)
                console.log(message, optionalParams);
            else
                console.log(message);
    };
    RxAVClient.printWelcome = function () {
        RxAVClient.printLog('===LeanCloud-Typescript-Rx-SDK=============');
        RxAVClient.printLog("version:" + currentConfig.sdkVersion);
        RxAVClient.printLog("pluginVersion:" + currentConfig.pluginVersion);
        RxAVClient.printLog("environment:node?" + currentConfig.isNode);
        RxAVClient.printLog("region:" + currentConfig.region);
        RxAVClient.printLog("server url:" + currentConfig.serverUrl);
        RxAVClient.printLog('===Rx is great,Typescript is wonderful!====');
    };
    return RxAVClient;
}());
exports.RxAVClient = RxAVClient;
