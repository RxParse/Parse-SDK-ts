import { SDKPlugins } from '../internal/SDKPlugins';

var currentConfig: {
    applicationId?: string,
    applicationKey?: string,
    serverUrl?: string,
    region?: string,
    isNode?: boolean,
    sdkVersion?: string,
    log?: boolean,
    pluginVersion?: number
} = {};
export class RxAVClient {
    static init(config: {
        appId: string,
        appKey: string,
        region?: string,
        serverUrl?: string,
        log?: boolean,
        pluginVersion?: number
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
        currentConfig.sdkVersion = '0.0.1';
        currentConfig.log = config.log;
        currentConfig.pluginVersion = config.pluginVersion;
        SDKPlugins.version = config.pluginVersion;

        RxAVClient.printWelcome();

    }
    protected static _headers: { [key: string]: any };
    static headers() {
        if (RxAVClient._headers == null)
            RxAVClient._headers = {
                'X-LC-Id': currentConfig.applicationId,
                'X-LC-Key': currentConfig.applicationKey,
                'Content-Type': 'application/json',
                'User-Agent': 'ts-sdk/' + currentConfig.sdkVersion
            }
        return RxAVClient._headers;
    }
    static serverUrl() {
        return currentConfig.serverUrl;
    }
    static currentConfig() {
        return currentConfig;
    }
    static isNode() {
        return RxAVClient.currentConfig().isNode;
    }
    static printLog(message?: any, ...optionalParams: any[]) {
        if (RxAVClient.currentConfig().log)
            if (optionalParams.length > 0)
                console.log(message, optionalParams);
            else console.log(message);
    }
    static printWelcome() {
        RxAVClient.printLog('===LeanCloud-Typescript-Rx-SDK=============');
        RxAVClient.printLog(`version:${currentConfig.sdkVersion}`);
        RxAVClient.printLog(`pluginVersion:${currentConfig.pluginVersion}`);
        RxAVClient.printLog(`environment:node?${currentConfig.isNode}`);
        RxAVClient.printLog(`region:${currentConfig.region}`);
        RxAVClient.printLog(`server url:${currentConfig.serverUrl}`);
        RxAVClient.printLog('===Rx is great,Typescript is wonderful!====');
    }
}
