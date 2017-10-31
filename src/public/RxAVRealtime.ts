import { Observable, Subject } from 'rxjs';
import { RxAVClient, RxAVApp } from './RxAVClient';
import { SDKPlugins } from '../internal/SDKPlugins';
import { AVCommand } from '../internal/command/AVCommand';
import { AVCommandResponse } from '../internal/command/AVCommandResponse';
import { IRxWebSocketController } from '../internal/websocket/controller/IRxWebSocketController';
import { RxWebSocketController } from '../internal/websocket/controller/RxWebSocketController';
import { RxAVObject, RxAVStorageObject } from './RxAVObject';
import { RxAVQuery } from './RxAVQuery';
import { MutableObjectState } from '../internal/object/state/MutableObjectState';
import { IObjectState } from "../internal/object/state/IObjectState";

export class RxAVRealtime {

    constructor(options?: any) {
        this._app = RxAVClient.instance.take(options);
        if (!RxAVRealtime._realtimeInstances.has(this.app.appId)) {
            RxAVRealtime._realtimeInstances.set(this.app.appId, this);
        }
    }
    protected _app: RxAVApp;
    get app() {
        return this._app;
    }
    private static singleton: RxAVRealtime;

    static getInstance(options?: any) {
        let rtn: RxAVRealtime = null;
        let app = RxAVClient.instance.take(options);
        if (RxAVRealtime._realtimeInstances.has(app.appId)) {
            rtn = RxAVRealtime._realtimeInstances.get(app.appId);
        } else {
            rtn = new RxAVRealtime(options);
        }
        return rtn;
    }

    private static _realtimeInstances: Map<string, RxAVRealtime> = new Map<string, RxAVRealtime>();


    protected _webSocketController: IRxWebSocketController;

    get RxWebSocketController() {
        if (this._webSocketController == undefined) {
            let instance = SDKPlugins.instance.WebSocketProvider.newInstance();
            this._webSocketController = new RxWebSocketController(instance);
        }
        return this._webSocketController;
    }
    messages: Observable<RxAVIMMessage>;

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
            return this.RxWebSocketController.open(this.pushRouterState.server);
        });
    }

    heartBeatingInterval: number = 20;
    timer: any;
    heartBeating(toggle: boolean, seconds?: number) {
        let internal = this.heartBeatingInterval;

        if (seconds != null || typeof seconds != 'undefined') {
            internal = seconds;
        }

        if (toggle)
            this.timer = setInterval(() => {
                this.RxWebSocketController.send("{}");
            }, internal * 1000);
        else clearInterval(this.timer);
    }

    /**
     * 客户端打开聊天 v2 协议
     * 
     * @param {string} clientId 当前客户端应用内唯一标识
     * @returns {Observable<boolean>} 
     * 
     * @memberOf RxAVRealtime
     */
    public connect(clientId: string, options?: any): Observable<boolean> {
        this._clientId = clientId;
        let deviceId = options && options.deviceId ? options.deviceId : undefined;
        return this.open().flatMap(opened => {
            if (opened) {
                let sessionOpenCmd = new AVCommand();
                sessionOpenCmd.data = {
                    cmd: 'session',
                    op: 'open',
                    ua: `rx-lean-js/${RxAVClient.instance.SDKVersion}`,
                };
                if (deviceId) sessionOpenCmd.data['deviceId'] = deviceId;
                return this.execute(sessionOpenCmd).map(response => {
                    RxAVIMMessage.initValidators();

                    this.messages = this.RxWebSocketController.onMessage.filter(message => {
                        let data = JSON.parse(message);
                        if (Object.prototype.hasOwnProperty.call(data, 'cmd')) {
                            if (data.cmd == 'direct') {
                                return true;
                            }
                        }
                        return false;
                    }).map(message => {
                        let data = JSON.parse(message);
                        let newMessage = new RxAVIMMessage();
                        newMessage.deserialize(data);
                        this.sendAck(newMessage.convId, newMessage.id);
                        return newMessage;
                    });
                    return response.body.op == 'opened';
                });
            }
            return Observable.from([opened]);
        });
    }

    public get(convId: string) {

    }

    public create(conversation: RxAVIMConversation) {
        let cmd = new RxAVIMConversationCommand(this, conversation).generateCreateCommand();
        return this.execute(cmd).map(response => {
            let state = new MutableObjectState();
            state.objectId = response.body.cid;
            state.createdAt = response.body.cdate;
            conversation.handlerSaved(state);
            return conversation;
        });
    }

    public update(conversation: RxAVIMConversation) {

    }

    public save(conversation: RxAVIMConversation) {

    }

    public list() {
        
    }


    public add(convId: string, members: string[]): Observable<boolean> {
        let convCMD = this.makeCommand()
            .attribute('cmd', 'conv')
            .attribute('cid', convId)
            .attribute('op', 'add')
            .attribute('m', members);

        return this.RxWebSocketController.execute(convCMD).map(response => {
            return response.satusCode < 300;
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
        let typeStr = typeof mimeType;
        if (typeStr == 'number') {
            delete data.type;
            msg = data;
            msg['_lctype'] = mimeType;
        } else if (typeStr == 'string') {
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
        }
        iMessage.content = JSON.stringify(msg);

        return this._send(convId, iMessage);
    }

    private _makeText(data: { [key: string]: any }) {
        let text = '';

        if (Object.prototype.hasOwnProperty.call(data, 'text')) {
            text = data.text;
            delete data.text;
        }

        let msg = {
            _lctype: -1,
            _lctext: text
        };
        delete data.type;
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
        delete data.type;
        return this._makeArrtributes(msg, data);
    }

    isEmpty(obj) {
        for (var key in obj) {
            if (obj.hasOwnProperty(key))
                return false;
        }
        return true;
    }

    private _makeArrtributes(msg: any, data: any) {
        let attrs = {};
        for (var key in data) {
            attrs[key] = data[key];
        }
        if (!this.isEmpty(attrs)) {
            msg['_lcattrs'] = attrs;
        }
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

    execute(cmd: AVCommand) {
        cmd.attribute('appId', this.app.appId);
        cmd.attribute('peerId', this.clientId);
        cmd.attribute('i', this.cmdId);
        return this.RxWebSocketController.execute(cmd);
    }

    makeCommand() {
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

export class RxAVIMCommand {
    protected realtime: RxAVRealtime;
    protected appId: string;
    protected clientId: string;
    protected cmd: string;
    protected op: string;
    protected arguments: { [key: string]: any };

    constructor(realtime: RxAVRealtime, options: any) {
        this.realtime = realtime;

        this.appId = this.realtime.app.appId;
        this.clientId = this.realtime.clientId;
        if (options) {
            if (options.appId) {
                this.appId = options.appId
            }
            if (options.clientId) {
                this.clientId = options.clientId
            }
            if (options.cmd) {
                this.cmd = options.cmd
            }
            if (options.op) {
                this.op = options.op
            }
            if (options.arguments) {
                this.arguments = options.arguments
            }
        }
    }

    set(key: string, value: any) {
        if (!this.arguments) this.arguments = {};
        this.arguments[key] = value;
        return this;
    }

    protected makeCommand() {
        let cmd = new AVCommand();
        cmd.attribute('op', this.op);
        cmd.attribute('cmd', this.cmd);
        for (let key in this.arguments) {
            cmd.attribute(key, this.arguments[key]);
        }
        return cmd;
    }
}

export class RxAVIMConversationCommand extends RxAVIMCommand {

    constructor(realtime: RxAVRealtime, conversation: RxAVIMConversation, options?: any) {

        if (!options) {
            options = {
                cmd: 'conv',
            };
        }
        super(realtime, options);
        this.conversation = conversation;
        this.attr = {};
    }
    conversation: RxAVIMConversation;

    protected attr: { [key: string]: any };

    generateCreateCommand() {
        this.op = 'start';

        let members = this.conversation.members;
        if (members) {
            if (members.length > 0) {
                this.set('m', members);
            }
        }

        this.set('attr', this.attr);
        for (let key in this.conversation.estimatedData) {
            if (!this.isInternalFields(key)) {
                this.attr[key] = this.conversation.estimatedData[key];
            }
        }

        this.set('unique', this.conversation.unique);
        this.set('transient', this.conversation.transient);

        return this.makeCommand();
    }

    isInternalFields(key: string) {
        let internalFields = ['m', 'c', 'mu', 'sys', 'tr', 'unique', 'lm', 'name', RxAVIMConversation.memoryMembersKey];
        return internalFields.indexOf(key) > -1;
    }

    get(convId: string) {
        this.op = 'query';
        let where = {};
        where['objectId'] = convId;
        this.set('where', where);

        return this.realtime.RxWebSocketController.execute(this.makeCommand()).map(response => {
            let conv = new RxAVIMConversation()
            let results = response.body.op;
            if (results) {
                if (results.length > 0) {
                    let r = results[0];
                    let state = new MutableObjectState();
                    state.serverData = [];
                    for (let key in r) {
                        state.serverData[key] = r[key];
                    }
                    state.objectId = response.body.cid;
                    state.createdAt = response.body.cdate;
                    conv.state = state;
                }
            }
            return conv;
        });
    }
}


export class RxAVIMConversation extends RxAVStorageObject {

    constructor() {
        super('_Conversation');
        this.unique = true;
        this.transient = false;
    }

    static readonly memoryMembersKey = '_members';

    get id() {
        return this.objectId;
    }

    set id(value: string) {
        this.objectId = value;
    }

    get m() {
        return this.getProperty('m');
    }

    get members() {
        return this.get(RxAVIMConversation.memoryMembersKey);
    }

    set members(m: Array<string>) {
        this.set(RxAVIMConversation.memoryMembersKey, m);
    }

    get name() {
        return this.getProperty('name');
    }

    set name(value: string) {
        this.setProperty('name', value);
    }

    get unique() {
        return this.getProperty('unique');
    }

    set unique(value: boolean) {
        this.initProperty('unique', value);
    }

    get transient() {
        return this.getProperty('tr');
    }

    set transient(value: boolean) {
        this.initProperty('tr', value);
    }

    get system() {
        return this.getProperty('sys');
    }

    set system(value: boolean) {
        this.initProperty('sys', value);
    }

    get creator() {
        return this.getProperty('c');
    }

    handlerSaved(serverState: IObjectState) {
        this.state.merge(serverState);
        this.isDirty = false;
    }
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
            this.from = data.fromPeerId;
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