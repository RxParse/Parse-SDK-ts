export declare class RxAVClient {
    static init(config: {
        appId: string;
        appKey: string;
        serverUrl?: string;
        log?: boolean;
        pluginVersion?: number;
    }): void;
    protected static _headers: {
        [key: string]: any;
    };
    static headers(): {
        [key: string]: any;
    };
    static serverUrl(): string;
    static currentConfig(): {
        applicationId?: string;
        applicationKey?: string;
        serverUrl?: string;
        isNode?: boolean;
        sdkVersion?: string;
        log?: boolean;
        pluginVersion?: number;
    };
    static isNode(): boolean;
    static printLog(message?: any, ...optionalParams: any[]): void;
    static printWelcome(): void;
}
