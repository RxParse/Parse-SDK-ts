export declare var applicationId: string;
export declare var applicationKey: string;
export declare var serverUrl: string;
export declare var version: string;
export declare class RxAVClient {
    static init(options: {
        appId: string;
        appKey: string;
        serverUrl?: string;
    }): void;
    protected static _headers: {
        [key: string]: any;
    };
    static headers(): {
        [key: string]: any;
    };
    static serverUrl(): string;
}
