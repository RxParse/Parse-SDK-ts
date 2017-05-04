import { IWebSocketClient } from '../../src/RxLeanCloud';
export declare class NodeJSWebSocketClient implements IWebSocketClient {
    onopen: (event: {
        target: NodeJSWebSocketClient;
    }) => void;
    onerror: (err: Error) => void;
    onclose: (event: {
        wasClean: boolean;
        code: number;
        reason: string;
        target: NodeJSWebSocketClient;
    }) => void;
    onmessage: (event: {
        data: any;
        type: string;
        target: NodeJSWebSocketClient;
    }) => void;
    readyState: number;
    wsc: any;
    open(url: string, protocols?: string | string[]): void;
    close(code?: number, data?: any): void;
    send(data: ArrayBuffer | string | Blob): void;
}
