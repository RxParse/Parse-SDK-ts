import { Observable } from 'rxjs';
export interface IRxWebSocketClient {
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
