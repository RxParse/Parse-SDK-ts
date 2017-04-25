import { IRxWebSocketClient } from './IRxWebSocketClient';
import { Observable, Subject } from 'rxjs';
export declare class RxBrowserWebSocketClient implements IRxWebSocketClient {
    wsc: WebSocket;
    url: string;
    protocols: string | string[];
    socket: Subject<any>;
    listeners: any;
    onMessage: Observable<any>;
    onClosed: Observable<{
        wasClean: boolean;
        code: number;
        reason: string;
    }>;
    open(url: string, protocols?: string | string[]): Observable<boolean>;
    close(code?: number, data?: any): void;
    send(data: any, options?: any): Observable<any>;
}
