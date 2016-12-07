import { SDKPlugins } from '../internal/SDKPlugins';
import { AVCommand } from '../internal/command/AVCommand';
import { AVCommandResponse } from '../internal/command/AVCommandResponse';
import { IAVCommandRunner } from '../internal/command/IAVCommandRunner';
import { AVCommandRunner } from '../internal/command/AVCommandRunner';
import { Observable } from 'rxjs';

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
    public static headers() {
        let config = RxAVClient.currentConfig();
        if (RxAVClient._headers == null) {
            RxAVClient._headers = {
                'X-LC-Id': config.applicationId,
                'X-LC-Key': config.applicationKey,
                'Content-Type': 'application/json'
            }
            if (RxAVClient.isNode()) {
                RxAVClient._headers['User-Agent'] = 'ts-sdk/' + config.sdkVersion;
            }
        }

        return RxAVClient._headers;
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
    protected static printWelcome() {
        RxAVClient.printLog('===LeanCloud-Typescript-Rx-SDK=============');
        RxAVClient.printLog(`version:${currentConfig.sdkVersion}`);
        RxAVClient.printLog(`pluginVersion:${currentConfig.pluginVersion}`);
        RxAVClient.printLog(`environment:node?${currentConfig.isNode}`);
        RxAVClient.printLog(`region:${currentConfig.region}`);
        RxAVClient.printLog(`server url:${currentConfig.serverUrl}`);
        RxAVClient.printLog('===Rx is great,Typescript is wonderful!====');
    }
    public static printLog(message?: any, ...optionalParams: any[]) {
        if (RxAVClient.currentConfig().log)
            if (optionalParams.length > 0)
                console.log(message, optionalParams);
            else console.log(message);
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
        let cmd = RxAVClient.generateAVCommand(relativeUrl, method, data,sessionToken);
        return SDKPlugins.instance.CommandRunner.runRxCommand(cmd).map(res => {
            return res.body;
        });
    }
}
