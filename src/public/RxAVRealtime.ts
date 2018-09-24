import { Observable, Subject } from 'rxjs';
import { RxParseClient, ParseApp } from './RxAVClient';
import { SDKPlugins } from '../internal/SDKPlugins';
import { AVCommand } from '../internal/command/AVCommand';
import { AVCommandResponse } from '../internal/command/AVCommandResponse';
import { IRxWebSocketController } from '../internal/websocket/controller/IRxWebSocketController';
import { RxWebSocketController } from '../internal/websocket/controller/RxWebSocketController';
import { RxParseObject, StorageObject } from './RxAVObject';
import { RxParseQuery } from './RxAVQuery';
import { MutableObjectState } from '../internal/object/state/MutableObjectState';
import { IObjectState } from "../internal/object/state/IObjectState";

export class RxAVRealtime {

    constructor(options?: any) {
        this._app = RxParseClient.instance.take(options);
        if (!RxAVRealtime._realtimeInstances.has(this.app.appId)) {
            RxAVRealtime._realtimeInstances.set(this.app.appId, this);
        }
        if (options) {
            if (options.hbi && typeof options.hbi == 'number') {
                this._heartBeatingInterval = options.hbi;
            }
            if (options.ari && typeof options.ari == 'number') {
                this._autoReconnectInternal = options.ari;
            }
        }
    }

    protected _app: ParseApp;
    get app() {
        return this._app;
    }

    static getInstance(options?: any) {
        let rtn: RxAVRealtime = null;
        let app = RxParseClient.instance.take(options);
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

    onConversationNotice: Observable<RxAVIMConversationNotice>;

    onMemberModified: Observable<RxAVIMMembersModifyNotice>;

    onMessage: Observable<RxAVIMMessage>;

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
    public open(wss?: string): Observable<boolean> {
        if (this.RxWebSocketController.websocketClient.readyState == 1) {
            if (wss) {
                if (wss != this._lastUsedWebsocketAddress) {
                    RxParseClient.printLog(`wss updated,try to connect new wss with ${wss}.`);
                    return this._open(wss);
                }
            }
            else {
                RxParseClient.printLog(`current connection with ${this._lastUsedWebsocketAddress} is still available.`);
                return Observable.from([true]);
            }
        }

        if (wss) {
            return this._open(wss)
        }

        if (this._lastUsedWebsocketAddress) {
            return this._open(this._lastUsedWebsocketAddress);
        }

        if (this.app.rtm != null) {
            return this._open(this.app.rtm);
        }

        let pushRouter = `${this.app.realtimeRouter}/v1/route?appId=${this.app.appId}&secure=1`;

        return RxParseClient.instance.request(pushRouter).flatMap(response => {
            this.pushRouterState = response.body;
            return this._open(this.pushRouterState.server);
        });
    }

    private _open(wss: string) {
        return this.RxWebSocketController.open(wss, 'lc.json.3').map(connected => {
            this._lastUsedWebsocketAddress = wss;
            return connected;
        });
    }

    private _isOpend() {

    }

    /**
     * 心跳包的时间间隔，默认是 3 分钟一次
     * 
     * @type {number}
     * @memberof RxAVRealtime
     */
    private _heartBeatingInterval: number = 180;
    private _heartBeatingTimer: Observable<number>;
    startHeartBeating(seconds?: number) {
        if (seconds) {
            if (typeof seconds == 'number') {
                this._heartBeatingInterval = seconds;
            }
        }
        this._heartBeatingTimer = Observable.timer(this._heartBeatingInterval, 1000 * this._heartBeatingInterval);
        return this._heartBeatingTimer.map(t => {
            this.RxWebSocketController.send("{}");
            return t;
        });
        // let internal = this.heartBeatingInterval;

        // if (seconds != null || typeof seconds != 'undefined') {
        //     internal = seconds;
        // }

        // if (toggle)
        //     this.timer = setInterval(() => {
        //         this.RxWebSocketController.send("{}");
        //     }, internal * 1000);
        // else clearInterval(this.timer);
    }
    private _sesstionToken: string;
    private _lastUsedWebsocketAddress: string;
    private _deviceId: string;
    private _tag: string;
    private _autoReconnectInternal: number = 5;
    private _autoReconnectSubject: Subject<boolean> = new Subject<boolean>();

    startAutoReconnect() {
        return this.RxWebSocketController.onState.flatMap(stateChanged => {
            if (stateChanged == 3) {
                let timer = Observable.timer(this._autoReconnectInternal, 1000 * this._autoReconnectInternal);
                let resumed = this.RxWebSocketController.onState.map(resumedState => {
                    return resumedState == 1;
                });
                let autoReconnectSuccessd = this._autoReconnectSubject.asObservable();
                let merged = Observable.merge(autoReconnectSuccessd, resumed);
                return timer.takeUntil(merged);
            }
        }).flatMap(disconnected => {
            if (this._sesstionToken) {
                return this._reconnect(this._sesstionToken);
            } else {
                return this._connect(this.clientId, this._connectionOptions);
            }
        });
    }

    private _connectionOptions: any;
    /**
     * 客户端打开聊天 v2 协议
     * 
     * @param {string} clientId 当前客户端应用内唯一标识
     * @returns {Observable<boolean>} 
     * 
     * @memberOf RxAVRealtime
     */
    public connect(clientId: string, options?: any): Observable<boolean> {

        return this._connect(clientId, options).map(sessionOpend => {
            if (sessionOpend) {
                RxAVIMMessage.initValidators();
                this._bindMemberNotice();
                this._bindConversationNotice();
                this._bindMessageNotice();

                this._startAutoACKResponse().subscribe(ackSent => {

                });

                this.startAutoReconnect().subscribe(reconnected => {
                    if (reconnected) {
                        this._autoReconnectSubject.next(true);
                        RxParseClient.printLog('auto reconnect successful.');
                    } else {
                        RxParseClient.printLog('auto reconnect failed...');
                    }
                });

                this.startHeartBeating().subscribe(ticks => {
                    RxParseClient.printLog('auto heart beating ticks.');
                });
            }
            return sessionOpend;
        });

    }

    private _connect(clientId: string, options?: any) {
        this._clientId = clientId;
        if (options) {
            this._connectionOptions = options;
        }
        let deviceId = options && options.deviceId ? options.deviceId : undefined;
        let tag = options && options.tag ? options.tag : undefined;
        return this.open().flatMap(opened => {
            if (opened) {
                let sessionOpenCmd = new AVCommand();
                sessionOpenCmd.data = {
                    cmd: 'session',
                    op: 'open',
                    ua: `rx-lean-js/${RxParseClient.instance.SDKVersion}`,
                };
                if (deviceId) {
                    sessionOpenCmd.data['deviceId'] = deviceId;
                    this._deviceId = deviceId;
                }
                if (tag) {
                    sessionOpenCmd.data['tag'] = tag;
                    this._tag = tag;
                }
                return this.execute(sessionOpenCmd).map(response => {
                    return response.body.op == 'opened';
                });
            }
            return Observable.from([opened]);
        });
    }

    private _reconnect(sessionToken) {
        let sessionOpenCmd = new AVCommand();
        sessionOpenCmd.data = {
            cmd: 'session',
            op: 'open',
            r: 1,
            st: sessionToken,
            ua: `rx-lean-js/${RxParseClient.instance.SDKVersion}`,
        };
        if (this._tag) {
            if (this._tag != 'default') {
                sessionOpenCmd['deviceId'] = this._deviceId;
            }
        }
        return this.execute(sessionOpenCmd).map(response => {
            return response.body.op == 'opened';
        });
    }

    close() {
        return this._close();
    }

    private _close() {
        let sessionCloseCmd = new AVCommand();
        sessionCloseCmd.data = {
            cmd: 'session',
            op: 'close'
        };

        return this.execute(sessionCloseCmd).map(response => {
            return response.body.op == 'closed';
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
            return response.statusCode < 300;
        });
    }

    public history(convId: string, date?: Date, limit?: number) {
        let iterator = new RxAVIMHistoryIterator();
        iterator.convId = convId;
        iterator.realtime = this;
        iterator.limit = limit ? limit : 20;
        iterator.startedAt = date ? date : new Date();
        return iterator;
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

    /**
     * 对话内可订阅的消息队列
     * 
     * @param {(string | RxAVIMConversation)} conv 
     * @returns 
     * @memberof RxAVRealtime
     */
    public onConversationMessage(conv: string | RxAVIMConversation): Observable<RxAVIMMessage> {
        if (!conv) {
            throw new Error('conv can NOT be undifined.');
        }
        let _convId = '';
        if (typeof conv == 'string') {
            _convId = conv;
        } else if (conv instanceof RxAVIMConversation) {
            _convId = conv.id;
        } else {
            throw new Error('conv must be a string or RxAVIMConversation');
        }
        return this.onMessage.filter(message => {
            return message.convId == conv;
        }).map(message => {
            return message;
        });
    }

    private _bindMessageNotice() {
        this.onMessage = this.RxWebSocketController.onMessage.filter(message => {
            let data = JSON.parse(message);
            if (Object.prototype.hasOwnProperty.call(data, 'cmd')) {
                if (data.cmd == 'direct') {
                    if (Object.prototype.hasOwnProperty.call(data, 'offline')) {

                    }
                    return true;
                }
            }
            return false;
        }).map(message => {
            let data = JSON.parse(message);
            let newMessage = new RxAVIMMessage();
            newMessage.deserialize(data);
            return newMessage;
        });
    }

    private _startAutoACKResponse() {
        return this.onMessage.flatMap(message => {
            return this.sendAck(message.convId, message.id);
        });
    }

    private _bindMemberNotice() {

        this.onMemberModified = this.RxWebSocketController.onMessage.filter(message => {
            let data = JSON.parse(message);
            if (Object.prototype.hasOwnProperty.call(data, 'cmd') && Object.prototype.hasOwnProperty.call(data, 'op')) {
                if (data.cmd == 'conv') {
                    return data.op == 'members-joined'
                        || data.op == 'members-left';
                }
            }
            return false;
        }).map(message => {
            let data = JSON.parse(message);
            let notice = new RxAVIMMembersModifyNotice();
            notice.operatedBy = data.initBy;
            notice.convId = data.cid;
            if (data.op == 'members-joined') {
                notice.added = data.m;
            } else if (data.op == 'members-left') {
                notice.removed = data.m;
            }
            return notice;
        });
    }

    public _bindConversationNotice() {
        this.onConversationNotice = this.RxWebSocketController.onMessage.filter(message => {
            let data = JSON.parse(message);
            if (Object.prototype.hasOwnProperty.call(data, 'cmd') && Object.prototype.hasOwnProperty.call(data, 'op')) {
                if (data.cmd == 'conv') {
                    return data.op == 'joined'
                        || data.op == 'left';
                }
            }
            return false;
        }).map(message => {
            let data = JSON.parse(message);
            let notice = new RxAVIMConversationNotice();
            notice.joined = false;
            notice.left = false;
            notice.operatedBy = data.initBy;
            notice.convId = data.cid;
            if (data.op == 'joined') {
                notice.joined = true;
            } else if (data.op == 'left') {
                notice.left = true;
            }
            return notice;
        });
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

    private isEmpty(obj) {
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
                iMessage.from = this.clientId;
                iMessage.timestamp = response.body.t;
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
        return this.RxWebSocketController.execute(ackCmd);
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
export class RxAVIMHistoryIterator {
    convId: string;
    realtime: RxAVRealtime;
    startedAt: Date;
    endedAt: Date;
    previousIndexMessageId: string;
    nextIndexMessageId: string;
    previousIndexTimestamp: Date;
    nextIndexTimestamp: Date;
    limit: number;
    previous(fixedSort?: boolean) {
        let cmd = this.makeCommand();
        if (this.previousIndexMessageId && this.previousIndexTimestamp) {
            cmd = cmd.attribute('mid', this.previousIndexMessageId)
                .attribute('t', this.previousIndexTimestamp.getTime());
        } else {
            cmd = cmd.attribute('t', this.startedAt.getTime())
                .attribute('tIncluded', true);
        }
        if (this.endedAt) {
            cmd = cmd.attribute('tt', this.endedAt.getTime()).attribute('ttIncluded', true);
        }
        return this.realtime.RxWebSocketController.execute(cmd).map(response => {
            let messages = this.unpackMessages(response);

            if (messages.length > 0) {
                this.previousIndexMessageId = messages[0].id;
                this.previousIndexTimestamp = new Date(messages[0].timestamp);
            }
            if (fixedSort) {
                return messages.sort((a, b) => a.timestamp - b.timestamp);
            }
            return messages.sort((a, b) => b.timestamp - a.timestamp);
        });
    }
    next(fixedSort?: boolean) {
        let cmd = this.makeCommand().attribute('direction', 'NEW');
        if (this.nextIndexMessageId && this.nextIndexTimestamp) {
            cmd = cmd.attribute('mid', this.nextIndexMessageId)
                .attribute('t', this.nextIndexTimestamp.getTime());
        } else {
            cmd = cmd.attribute('t', this.startedAt.getTime())
                .attribute('tIncluded', true);
        }
        if (this.endedAt) {
            cmd = cmd.attribute('tt', this.endedAt.getTime()).attribute('ttIncluded', true);
        }
        return this.realtime.RxWebSocketController.execute(cmd).map(response => {
            let messages = this.unpackMessages(response);

            if (messages.length > 0) {
                this.nextIndexMessageId = messages[messages.length - 1].id;
                this.nextIndexTimestamp = new Date(messages[messages.length - 1].timestamp);
            }
            if (fixedSort) {
                return messages.sort((a, b) => b.timestamp - a.timestamp);
            }
            return messages.sort((a, b) => a.timestamp - b.timestamp);
        });
    }

    unpackMessages(response: AVCommandResponse) {
        let logs = response.body['logs'] as Array<any>;

        let messages = logs.map(metaLog => {
            let message = new RxAVIMMessage();
            message.from = metaLog['from'];
            message.timestamp = metaLog['timestamp'];
            message.bin = metaLog['bin'];
            message.id = metaLog['msgId'];
            message.content = metaLog['data'];
            return message;
        });
        return messages;
    }
    makeCommand() {
        let cmd = this.realtime.makeCommand()
            .attribute('cmd', 'logs')
            .attribute('cid', this.convId)
            .attribute('l', this.limit);
        return cmd;
    }
}

export interface IRxAVIMMessage {
    convId: string;
    id: string;
    from: string;
    timestamp: number;
    content: string;
    offline: boolean;
    bin: boolean;
    deserialize(data: any);
    serialize(): string;
    validate(): boolean;
}

export class RxAVIMConversationNotice {
    clientId: string;
    convId: string;
    left: boolean;
    joined: boolean;
    operatedBy: string;
}

export class RxAVIMMembersModifyNotice {
    convId: string;
    decrease: boolean;
    removed: string[];
    increase: boolean;
    added: string[];
    operatedBy: string;
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
        let internalFields = ['m', 'c', 'mu', 'sys', 'tr', 'unique', 'lm', RxAVIMConversation.memoryMembersKey];
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
                    state.serverData = new Map<string, object>();
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


export class RxAVIMConversation extends StorageObject {

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
    bin: boolean;
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