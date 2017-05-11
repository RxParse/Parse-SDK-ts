import { Observable, Subject } from 'rxjs';
import { RxAVClient, RxAVApp } from './RxAVClient';
import { SDKPlugins } from '../internal/SDKPlugins';
import { AVCommand } from '../internal/command/AVCommand';
import { IRxWebSocketController } from '../internal/websocket/controller/IRxWebSocketController';

export class RxAVRealtime {

    constructor(options?: any) {
        if (options) {
            if (options.app) {
                if (options.app instanceof RxAVApp) {
                    this._app = options.app;
                }
            }
        }
    }
    protected _app: RxAVApp;
    get app() {
        return this._app;
    }
    private static singleton: RxAVRealtime;

    static get instance(): RxAVRealtime {
        if (RxAVRealtime.singleton == null)
            RxAVRealtime.singleton = new RxAVRealtime({ app: RxAVClient.instance.currentApp });
        return RxAVRealtime.singleton;
    }
    get RxWebSocketController() {
        return SDKPlugins.instance.WebSocketController;
    }
    messages: Subject<RxAVIMMessage>;
    pushRouterState: any;

    private _clientId: string;
    get clientId() {
        return this._clientId;
    }

    /**
     * 打开与 Push Server 的 WebSocket
     * 
     * @returns {Observable<boolean>} 
     * 
     * @memberOf RxAVRealtime
     */
    public open(): Observable<boolean> {
        if (this.app.rtm != null)
            return this.RxWebSocketController.open(this.app.rtm);

        let pushRouter = `${this.app.realtimeRouter}/v1/route?appId=${this.app.appId}&secure=1`;

        return RxAVClient.instance.request(pushRouter).flatMap(response => {
            this.pushRouterState = response.body;
            console.log('pushRouterState', this.pushRouterState);
            return this.RxWebSocketController.open(this.pushRouterState.server);
        });
    }

    /**
     * 客户端打开聊天 v2 协议
     * 
     * @param {string} clientId 当前客户端应用内唯一标识
     * @returns {Observable<boolean>} 
     * 
     * @memberOf RxAVRealtime
     */
    public connect(clientId: string): Observable<boolean> {
        this._clientId = clientId;
        return this.open().flatMap(opened => {
            if (opened) {
                let sessionOpenCmd = new AVCommand();
                sessionOpenCmd.data = {
                    cmd: 'session',
                    op: 'open',
                    appId: this.app.appId,
                    peerId: clientId,
                    i: this.cmdId,
                    deviceId: 'xman',
                    ua: `ts-sdk/${RxAVClient.instance.SDKVersion}`,
                };
                return this.RxWebSocketController.execute(sessionOpenCmd).map(response => {
                    RxAVIMMessage.initValidators();
                    // this.RxWebSocketController.onState.subscribe(state => {
                    //     console.log(state);
                    // });
                    this.messages = new Subject<RxAVIMMessage>();
                    this.RxWebSocketController.onMessage.subscribe(message => {
                        let data = JSON.parse(message);
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

        return this.RxWebSocketController.execute(msgCmd).map(response => {
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
        this.RxWebSocketController.execute(ackCmd);
    }

    private makeCommand() {
        let cmd = new AVCommand();
        cmd.attribute('appId', this.app.appId);
        cmd.attribute('peerId', this.clientId);
        cmd.attribute('i', this.cmdId);
        return cmd;
    }

    private idSeed = -65535;
    private cmdIdAutomation() {
        return this.idSeed++;
    }
    get cmdId() {
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
    validate(): boolean;
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
    validate(): boolean {
        return true;
    }
    public toJson() {
        var rtn: any = {};
        for (let key in this) {
            rtn[key] = this[key];
        }

        try {
            let msgMap = JSON.parse(this.content);
            for (let index = 0; index < RxAVIMMessage.validators.length; index++) {
                var validator = RxAVIMMessage.validators[index];
                if (validator(this.content, rtn)) {
                    break;
                }
            }
        } catch (error) {

        }
        return rtn;
    }

    public static initValidators() {
        RxAVIMMessage.validators = [];
        let commonSet = (msgMap: any, dataMapRef: any): void => {
            if (Object.prototype.hasOwnProperty.call(msgMap, '_lcattrs')) {
                let attrs = msgMap['_lcattrs'];
                for (let key in attrs) {
                    dataMapRef[key] = attrs[key];
                }
            }
        };

        let textValidator = (msgStr: any, dataMapRef: any): boolean => {
            let msgMap = JSON.parse(msgStr);
            if (Object.prototype.hasOwnProperty.call(msgMap, '_lctype')) {
                let valid = msgMap['_lctype'] == -1;
                if (valid) {
                    dataMapRef.type = 'text';
                    dataMapRef.text = msgMap['_lctext'];
                    commonSet(msgMap, dataMapRef);
                }
                return valid;
            }
            return false;
        };


        let imageValidator = (msgStr: any, dataMapRef: any): boolean => {
            let msgMap = JSON.parse(msgStr);
            if (Object.prototype.hasOwnProperty.call(msgMap, '_lctype')) {
                let valid = msgMap['_lctype'] == -2;
                commonSet(msgMap, dataMapRef);
                if (valid) {
                    dataMapRef.type = 'image';
                    let fileInfo = msgMap['_lcfile'];
                    if (Object.prototype.hasOwnProperty.call(fileInfo, 'url')) {
                        dataMapRef.url = fileInfo.url;
                    }
                    if (Object.prototype.hasOwnProperty.call(fileInfo, 'objId')) {
                        dataMapRef.fileId = fileInfo.objId;
                    }
                    if (Object.prototype.hasOwnProperty.call(fileInfo, 'metaData')) {
                        dataMapRef.metaData = fileInfo.metaData;
                    }
                }
                return valid;
            }
            return false;
        };

        RxAVIMMessage.validators.push(textValidator);
        RxAVIMMessage.validators.push(imageValidator);
    }

    public static validators: Array<(msgMap: any, dataMapRef: any) => boolean>;
}