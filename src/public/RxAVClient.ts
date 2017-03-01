import { SDKPlugins } from '../internal/SDKPlugins';
import { AVCommand } from '../internal/command/AVCommand';
import { AVCommandResponse } from '../internal/command/AVCommandResponse';
import { IAVCommandRunner } from '../internal/command/IAVCommandRunner';
import { AVCommandRunner } from '../internal/command/AVCommandRunner';
import { IStorage } from '../internal/storage/IStorage';
import { IDeviceInfo } from '../internal/analytics/IDeviceInfo';
import { StorageController } from '../internal/storage/controller/StorageController';
import { Observable } from 'rxjs';
var pjson = require('../package.json');

var currentConfig: {
    applicationId?: string,
    applicationKey?: string,
    serverUrl?: string,
    region?: string,
    isNode?: boolean,
    sdkVersion?: string,
    log?: boolean,
    pluginVersion?: number,
    runtime?: string
} = {};

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
        serverUrl?: string,
        log?: boolean,
        pluginVersion?: number,
        plugins?: {
            storage?: IStorage,
            device?: IDeviceInfo
        }
    }): void {
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
        SDKPlugins.version = config.pluginVersion;
        if (config.plugins) {
            if (config.plugins.storage) {
                SDKPlugins.instance.StorageProvider = config.plugins.storage;
                SDKPlugins.instance.LocalStorageControllerInstance = new StorageController(config.plugins.storage);
            }
            if (config.plugins.device) {
                SDKPlugins.instance.DeviceProvider = config.plugins.device;
            }
        }
        RxAVClient.printWelcome();
    }
    static restoreSettings(): Observable<boolean> {
        return SDKPlugins.instance.LocalStorageControllerInstance.load().map(provider => {
            return provider != null;
        });
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
    public static serverUrl() {
        return currentConfig.serverUrl;
    }
    public static currentConfig() {
        if (currentConfig.serverUrl == null) throw new Error('RxAVClient 未被初始化，请调用 RxAVClient.init({appId,appKey}) 进行初始化.');
        return currentConfig;
    }
    public static isNode() {
        return RxAVClient.currentConfig().isNode;
    }
    public static inLeanEngine() {
        return false;
    }
    protected static printWelcome() {
        RxAVClient.printLog('===LeanCloud-Typescript-Rx-SDK=============');
        // RxAVClient.printLog(`version:${currentConfig.sdkVersion}`);
        RxAVClient.printLog(`pluginVersion:${currentConfig.pluginVersion}`);
        RxAVClient.printLog(`environment:node?${currentConfig.isNode}`);
        RxAVClient.printLog(`region:${currentConfig.region}`);
        RxAVClient.printLog(`server url:${currentConfig.serverUrl}`);
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

    public static request(relativeUrl: string, method: string, data?: { [key: string]: any }, sessionToken?: string): Observable<{ [key: string]: any }> {
        let cmd = RxAVClient.generateAVCommand(relativeUrl, method, data, sessionToken);
        return SDKPlugins.instance.CommandRunner.runRxCommand(cmd).map(res => {
            return res.body;
        });
    }
}
