import { Observable, Observer, Subject } from 'rxjs';

export interface IRxWebSocketClient {
    state: string;
    onState: Observable<string>;
    onMessage: Observable<any>;
    open(url: string, protocols?: string | string[]): Observable<boolean>;
    close(code?: number, data?: any): void;
    send(data: any, options?: any): Observable<any>;
}