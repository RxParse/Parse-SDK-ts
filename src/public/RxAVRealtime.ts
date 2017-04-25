import { Observable, Subject } from 'rxjs';
import { RxAVClient, RxAVObject, RxAVUser } from '../RxLeanCloud';
import { AVCommand } from '../internal/command/AVCommand';
import { RxWebSocketClient } from '../internal/websocket/RxWebSocketClient';
export class RxAVRealtime {

    private static singleton: RxAVRealtime;

    static get instance(): RxAVRealtime {
        if (RxAVRealtime.singleton == null)
            RxAVRealtime.singleton = new RxAVRealtime();
        return RxAVRealtime.singleton;
    }
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
    public connect(clientId: string): Observable<boolean> {
        this.clientId = clientId;
        let pushRouter = `https://${RxAVClient.instance.appRouterState.RealtimeRouterServer}/v1/route?appId=${RxAVClient.instance.currentConfiguration.applicationId}&secure=1`;
        return RxAVClient.instance.request(pushRouter).flatMap(response => {
            this.pushRouterState = response.body;
            console.log('pushRouterState', this.pushRouterState);
            this.wsc = new RxWebSocketClient(this.pushRouterState.server);
            return this.wsc.open();
        }).flatMap(opened => {
            if (opened) {
                let sessionOpenCmd = new AVCommand();
                sessionOpenCmd.data = {
                    cmd: 'session',
                    op: 'open',
                    appId: RxAVClient.instance.currentConfiguration.applicationId,
                    peerId: clientId,
                    i: this.cmdId,
                    ua: 'ts-sdk',
                };
                return this.wsc.execute(sessionOpenCmd).map(response => {
                    this.messages = new Subject<RxAVIMMessage>();
                    this.wsc.rxWebSocketClient.onMessage.subscribe(data => {
                        if (Object.prototype.hasOwnProperty.call(data, 'cmd')) {
                            if (data.cmd == 'direct') {
                                let newMessage = new RxAVIMMessage();
                                newMessage.deserialize(data);
                                this.messages.next(newMessage);
                                this.sendAck(newMessage.convId, newMessage.id);
                            }
                        }
                    });
                    return response.body.op == 'opened';
                });
            }
            return Observable.from([opened]);
        });
    }

    /**
     * 
     * 
     * @param {string} convId 
     * @param {{ [key: string]: any }} data 
     * @returns 
     * 
     * @memberOf RxAVRealtime
     */
    public send(convId: string, data: { [key: string]: any }) {
        let mimeType = 'text';
        let iMessage = new RxAVIMMessage();

        let msg = {};
        if (Object.prototype.hasOwnProperty.call(data, 'type')) {
            mimeType = data.type;
        }
        switch (mimeType) {
            case 'text':
                msg = this._makeText(data);
                break;
            case 'image' || 'img' || 'pic' || 'picture':
                msg = this._makeImage(data);
                break;
            default:
                msg = data;
                break;
        }

        iMessage.content = JSON.stringify(msg);

        return this._send(convId, iMessage);
    }

    private _makeText(data: { [key: string]: any }) {
        let text = '';
        if (Object.prototype.hasOwnProperty.call(data, 'text')) {
            text = data.text;
        }
        let msg = {
            _lctype: -1,
            _lctext: text
        };
        return this._makeArrtributes(msg, data);
    }

    private _makeImage(data: { [key: string]: any }) {
        let url = `https://dn-lhzo7z96.qbox.me/1493019545196`;
        if (Object.prototype.hasOwnProperty.call(data, 'url')) {
            url = data.url;
            delete data.url;
        }
        let text = '';
        if (Object.prototype.hasOwnProperty.call(data, 'text')) {
            text = data.text;
            delete data.text;
        }

        let msg = {
            _lctype: -2,
            _lctext: text,
            _lcfile: {
                url: url
            }
        };
        return this._makeArrtributes(msg, data);
    }

    private _makeArrtributes(msg: any, data: any) {
        let attrs = {};
        for (var key in data) {
            attrs[key] = data.key;
        }
        msg['_lcattrs'] = attrs;
        return msg;
    }

    private _send(convId: string, iMessage: IRxAVIMMessage, tr?: boolean, r?: boolean, level?: number) {
        let msgCmd = this.makeCommand()
            .attribute('cmd', 'direct')
            .attribute('cid', convId)
            .attribute('r', r ? r : true)
            .attribute('level', level ? level : 1)
            .attribute('msg', iMessage.serialize());

        return this.wsc.execute(msgCmd).map(response => {
            if (Object.prototype.hasOwnProperty.call(response.body, 'uid')) {
                iMessage.id = response.body.uid;
            }
            return iMessage;
        });
    }

    private sendAck(convId: string, msgId?: string, fromts?: number, tots?: number) {
        let ackCmd = this.makeCommand()
            .attribute('cid', convId)
            .attribute('cmd', 'ack');

        if (msgId) {
            ackCmd = ackCmd.attribute('mid', msgId);
        }
        if (fromts) {
            ackCmd = ackCmd.attribute('fromts', fromts);
        }
        if (tots) {
            ackCmd = ackCmd.attribute('tots', tots);
        }
        this.wsc.execute(ackCmd);
    }

    private makeCommand() {
        let cmd = new AVCommand();
        cmd.attribute('appId', RxAVClient.instance.currentConfiguration.applicationId);
        cmd.attribute('peerId', this.clientId);
        cmd.attribute('i', this.cmdId);
        return cmd;
    }

    private idSeed = -65535;
    private cmdIdAutomation() {
        return this.idSeed++;
    }
    private get cmdId() {
        return this.cmdIdAutomation();
    }
}

export interface IRxAVIMMessage {
    convId: string;
    id: string;
    from: string;
    timestamp: number;
    content: string;
    offline: boolean;
    deserialize(data: any);
    serialize(): string;
}

export class RxAVIMMessage implements IRxAVIMMessage {
    convId: string;
    id: string;
    from: string;
    timestamp: number;
    content: string;
    offline: boolean;
    public deserialize(data: any) {
        if (Object.prototype.hasOwnProperty.call(data, 'cid')) {
            this.convId = data.cid;
        }
        if (Object.prototype.hasOwnProperty.call(data, 'id')) {
            this.id = data.id;
        }
        if (Object.prototype.hasOwnProperty.call(data, 'timestamp')) {
            this.timestamp = data.timestamp;
        }
        if (Object.prototype.hasOwnProperty.call(data, 'fromPeerId')) {
            this.from = data.cid;
        }
        if (Object.prototype.hasOwnProperty.call(data, 'offline')) {
            this.offline = data.offline;
        }
        if (Object.prototype.hasOwnProperty.call(data, 'msg')) {
            this.content = data.msg;
        }
    }

    public serialize(): string {
        return this.content;
    }

    public toJson() {
        return JSON.stringify(this);
    }
}