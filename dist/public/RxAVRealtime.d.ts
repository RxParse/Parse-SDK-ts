import { Observable, Subject } from 'rxjs';
import { RxWebSocketClient } from '../internal/websocket/RxWebSocketClient';
export declare class RxAVRealtime {
    private static singleton;
    static readonly instance: RxAVRealtime;
    wsc: RxWebSocketClient;
    messages: Subject<RxAVIMMessage>;
    pushRouterState: any;
    clientId: string;
    /**
     * 客户端打开链接
     *
     * @param {string} clientId 当前客户端应用内唯一标识
     * @returns {Observable<boolean>}
     *
     * @memberOf RxAVRealtime
     */
    connect(clientId: string): Observable<boolean>;
    /**
     *
     *
     * @param {string} convId
     * @param {{ [key: string]: any }} data
     * @returns
     *
     * @memberOf RxAVRealtime
     */
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
