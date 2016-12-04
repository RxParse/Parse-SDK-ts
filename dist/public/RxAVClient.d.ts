import { AVCommand } from '../internal/command/AVCommand';
import { Observable } from 'rxjs';
export declare class RxAVClient {
    static init(config: {
        appId: string;
        appKey: string;
        region?: string;
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
        region?: string;
        isNode?: boolean;
        sdkVersion?: string;
        log?: boolean;
        pluginVersion?: number;
    };
    static isNode(): boolean;
    protected static printWelcome(): void;
    static printLog(message?: any, ...optionalParams: any[]): void;
    protected static generateAVCommand(relativeUrl: string, method: string, data: {
        [key: string]: any;
    }): AVCommand;
    static request(relativeUrl: string, method: string, data: {
        [key: string]: any;
    }): Observable<{
        [key: string]: any;
    }>;
}
