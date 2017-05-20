export interface IWebSocketClient {
    onopen: (event: { target: IWebSocketClient }) => void;
    onerror: (err: Error) => void;
    onclose: (event: { wasClean: boolean; code: number; reason: string; target: IWebSocketClient }) => void;
    onmessage: (event: { data: any; type: string; target: IWebSocketClient }) => void;
    readyState: number;
    open(url: string, protocols?: string | string[]): void;
    close(code: number, reason: string): void;
    send(data: ArrayBuffer | string | Blob): void;
}