"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const rxjs_1 = require("rxjs");
const RxAVClient_1 = require("./RxAVClient");
const SDKPlugins_1 = require("../internal/SDKPlugins");
const AVCommand_1 = require("../internal/command/AVCommand");
class RxAVRealtime {
    constructor() {
        this.idSeed = -65535;
    }
    static get instance() {
        if (RxAVRealtime.singleton == null)
            RxAVRealtime.singleton = new RxAVRealtime();
        return RxAVRealtime.singleton;
    }
    get RxWebSocketController() {
        return SDKPlugins_1.SDKPlugins.instance.WebSocketController;
    }
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
    open() {
        if (RxAVClient_1.RxAVClient.instance.currentConfiguration.server.rtm != null)
            return this.RxWebSocketController.open(RxAVClient_1.RxAVClient.instance.currentConfiguration.server.rtm);
        let pushRouter = `${RxAVClient_1.RxAVClient.instance.appRouterState.RealtimeRouterServer}/v1/route?appId=${RxAVClient_1.RxAVClient.instance.currentConfiguration.applicationId}&secure=1`;
        if (RxAVClient_1.RxAVClient.instance.currentConfiguration.server.pushRouter != null)
            pushRouter = RxAVClient_1.RxAVClient.instance.currentConfiguration.server.pushRouter;
        return RxAVClient_1.RxAVClient.instance.request(pushRouter).flatMap(response => {
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
    connect(clientId) {
        this._clientId = clientId;
        return this.open().flatMap(opened => {
            if (opened) {
                let sessionOpenCmd = new AVCommand_1.AVCommand();
                sessionOpenCmd.data = {
                    cmd: 'session',
                    op: 'open',
                    appId: RxAVClient_1.RxAVClient.instance.currentConfiguration.applicationId,
                    peerId: clientId,
                    i: this.cmdId,
                    deviceId: 'xman',
                    ua: `ts-sdk/${RxAVClient_1.RxAVClient.instance.SDKVersion}`,
                };
                return this.RxWebSocketController.execute(sessionOpenCmd).map(response => {
                    RxAVIMMessage.initValidators();
                    this.messages = new rxjs_1.Subject();
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
            return rxjs_1.Observable.from([opened]);
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
    send(convId, data) {
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
    _makeText(data) {
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
    _makeImage(data) {
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
    _makeArrtributes(msg, data) {
        let attrs = {};
        for (var key in data) {
            attrs[key] = data.key;
        }
        msg['_lcattrs'] = attrs;
        return msg;
    }
    _send(convId, iMessage, tr, r, level) {
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
    sendAck(convId, msgId, fromts, tots) {
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
    makeCommand() {
        let cmd = new AVCommand_1.AVCommand();
        cmd.attribute('appId', RxAVClient_1.RxAVClient.instance.currentConfiguration.applicationId);
        cmd.attribute('peerId', this.clientId);
        cmd.attribute('i', this.cmdId);
        return cmd;
    }
    cmdIdAutomation() {
        return this.idSeed++;
    }
    get cmdId() {
        return this.cmdIdAutomation();
    }
}
exports.RxAVRealtime = RxAVRealtime;
class RxAVIMMessage {
    deserialize(data) {
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
    serialize() {
        return this.content;
    }
    validate() {
        return true;
    }
    toJson() {
        var rtn = {};
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
        }
        catch (error) {
        }
        return rtn;
    }
    static initValidators() {
        RxAVIMMessage.validators = [];
        let commonSet = (msgMap, dataMapRef) => {
            if (Object.prototype.hasOwnProperty.call(msgMap, '_lcattrs')) {
                let attrs = msgMap['_lcattrs'];
                for (let key in attrs) {
                    dataMapRef[key] = attrs[key];
                }
            }
        };
        let textValidator = (msgStr, dataMapRef) => {
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
        let imageValidator = (msgStr, dataMapRef) => {
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
}
exports.RxAVIMMessage = RxAVIMMessage;
