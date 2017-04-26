import { IRxWebSocketClient } from '../../src/RxLeanCloud';
import { Observable, Subject } from 'rxjs';
export declare class RxNodeJSWebSocketClient implements IRxWebSocketClient {
    wsc: any;
    url: string;
    protocols: string | string[];
    listeners: any;
    onMessage: Observable<any>;
    socket: Subject<any>;
    state: string;
    onState: Subject<string>;
    open(url: string, protocols?: string | string[]): Observable<boolean>;
    close(code?: number, data?: any): void;
    send(data: any, options?: any): Observable<any>;
}
