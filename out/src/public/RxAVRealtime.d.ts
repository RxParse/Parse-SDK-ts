import { Observable, Subject } from 'rxjs';
import { RxWebSocketClient } from '../internal/httpClient/RxWebSocketClient';
export declare class RxAVRealtime {
    private static singleton;
    static readonly instance: RxAVRealtime;
    wsc: RxWebSocketClient;
    messages: Subject<RxAVIMMessage>;
    pushRouterState: any;
    clientId: string;
    connect(clientId: string): Observable<boolean>;
    send(convId: string, data: {
        [key: string]: any;
    }): Observable<IRxAVIMMessage>;
    private _makeText(data);
    private _makeImage(data);
    private _makeArrtributes(msg, data);
    private _send(convId, iMessage, tr?, r?, level?);
    private sendAck(convId, msgId?, fromts?, tots?);
    private makeCommand();
    private idSeed;
    private cmdIdAutomation();
    private readonly cmdId;
}
export interface IRxAVIMMessage {
    convId: string;
    id: string;
    from: string;
    timestamp: number;
    content: string;
    offline: boolean;
    deserialize(data: any): any;
    serialize(): string;
}
export declare class RxAVIMMessage implements IRxAVIMMessage {
    convId: string;
    id: string;
    from: string;
    timestamp: number;
    content: string;
    offline: boolean;
    deserialize(data: any): void;
    serialize(): string;
    toJson(): string;
}
