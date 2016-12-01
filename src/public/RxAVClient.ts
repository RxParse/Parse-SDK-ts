export var applicationId: string;
export var applicationKey: string;
export var serverUrl: string;
export var version: string = '0.0.1';
export class RxAVClient {
    static init(options: {
        appId: string,
        appKey: string,
        serverUrl?: string,
    }): void {
        applicationId = options.appId;
        applicationKey = options.appKey;
        serverUrl = options.serverUrl != null ? options.serverUrl : 'https://api.leancloud.cn/1.1';
    }
    protected static _headers: { [key: string]: any };
    static headers() {
        if (RxAVClient._headers == null)
            RxAVClient._headers = {
                'X-LC-Id': applicationId,
                'X-LC-Key': applicationKey,
                'Content-Type': 'application/json',
                'User-Agent': 'ts-sdk/' + version,
            }
        return RxAVClient._headers;
    }
    static serverUrl() {
        return serverUrl;
    }
}
