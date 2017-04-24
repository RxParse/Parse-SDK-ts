"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var rxjs_1 = require("rxjs");
var RxLeanCloud_1 = require("../RxLeanCloud");
var AVCommand_1 = require("../internal/command/AVCommand");
var RxWebSocketClient_1 = require("../internal/httpClient/RxWebSocketClient");
var RxAVRealtime = (function () {
    function RxAVRealtime() {
        this.idSeed = -65535;
    }
    Object.defineProperty(RxAVRealtime, "instance", {
        get: function () {
            if (RxAVRealtime.singleton == null)
                RxAVRealtime.singleton = new RxAVRealtime();
            return RxAVRealtime.singleton;
        },
        enumerable: true,
        configurable: true
    });
    RxAVRealtime.prototype.connect = function (clientId) {
        var _this = this;
        this.clientId = clientId;
        var pushRouter = "https://" + RxLeanCloud_1.RxAVClient.instance.appRouterState.RealtimeRouterServer + "/v1/route?appId=" + RxLeanCloud_1.RxAVClient.instance.currentConfiguration.applicationId + "&secure=1";
        return RxLeanCloud_1.RxAVClient.instance.request(pushRouter).flatMap(function (response) {
            _this.pushRouterState = response.body;
            console.log('pushRouterState', _this.pushRouterState);
            _this.wsc = new RxWebSocketClient_1.RxWebSocketClient(_this.pushRouterState.server);
            return _this.wsc.open();
        }).flatMap(function (opened) {
            if (opened) {
                var sessionOpenCmd = new AVCommand_1.AVCommand();
                sessionOpenCmd.data = {
                    cmd: 'session',
                    op: 'open',
                    appId: RxLeanCloud_1.RxAVClient.instance.currentConfiguration.applicationId,
                    peerId: clientId,
                    i: _this.cmdId,
                    ua: 'ts-sdk',
                };
                return _this.wsc.execute(sessionOpenCmd).map(function (response) {
                    _this.messages = new rxjs_1.Subject();
                    _this.wsc.socket.subscribe(function (data) {
                        if (Object.prototype.hasOwnProperty.call(data, 'cmd')) {
                            if (data.cmd == 'direct') {
                                var newMessage = new RxAVIMMessage();
                                newMessage.deserialize(data);
                                _this.messages.next(newMessage);
                                _this.sendAck(newMessage.convId, newMessage.id);
                            }
                        }
                    });
                    return response.body.op == 'opened';
                });
            }
            return rxjs_1.Observable.from([opened]);
        });
    };
    RxAVRealtime.prototype.send = function (convId, data) {
        var mimeType = 'text';
        var iMessage = new RxAVIMMessage();
        var msg = {};
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
    };
    RxAVRealtime.prototype._makeText = function (data) {
        var text = '';
        if (Object.prototype.hasOwnProperty.call(data, 'text')) {
            text = data.text;
        }
        var msg = {
            _lctype: -1,
            _lctext: text
        };
        return this._makeArrtributes(msg, data);
    };
    RxAVRealtime.prototype._makeImage = function (data) {
        var url = "https://dn-lhzo7z96.qbox.me/1493019545196";
        if (Object.prototype.hasOwnProperty.call(data, 'url')) {
            url = data.url;
            delete data.url;
        }
        var text = '';
        if (Object.prototype.hasOwnProperty.call(data, 'text')) {
            text = data.text;
            delete data.text;
        }
        var msg = {
            _lctype: -2,
            _lctext: text,
            _lcfile: {
                url: url
            }
        };
        return this._makeArrtributes(msg, data);
    };
    RxAVRealtime.prototype._makeArrtributes = function (msg, data) {
        var attrs = {};
        for (var key in data) {
            attrs[key] = data.key;
        }
        msg['_lcattrs'] = attrs;
        return msg;
    };
    RxAVRealtime.prototype._send = function (convId, iMessage, tr, r, level) {
        var msgCmd = this.makeCommand()
            .attribute('cmd', 'direct')
            .attribute('cid', convId)
            .attribute('r', r ? r : true)
            .attribute('level', level ? level : 1)
            .attribute('msg', iMessage.serialize());
        return this.wsc.execute(msgCmd).map(function (response) {
            if (Object.prototype.hasOwnProperty.call(response.body, 'uid')) {
                iMessage.id = response.body.uid;
            }
            return iMessage;
        });
    };
    RxAVRealtime.prototype.sendAck = function (convId, msgId, fromts, tots) {
        var ackCmd = this.makeCommand()
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
    };
    RxAVRealtime.prototype.makeCommand = function () {
        var cmd = new AVCommand_1.AVCommand();
        cmd.attribute('appId', RxLeanCloud_1.RxAVClient.instance.currentConfiguration.applicationId);
        cmd.attribute('peerId', this.clientId);
        cmd.attribute('i', this.cmdId);
        return cmd;
    };
    RxAVRealtime.prototype.cmdIdAutomation = function () {
        return this.idSeed++;
    };
    Object.defineProperty(RxAVRealtime.prototype, "cmdId", {
        get: function () {
            return this.cmdIdAutomation();
        },
        enumerable: true,
        configurable: true
    });
    return RxAVRealtime;
}());
exports.RxAVRealtime = RxAVRealtime;
var RxAVIMMessage = (function () {
    function RxAVIMMessage() {
    }
    RxAVIMMessage.prototype.deserialize = function (data) {
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
    };
    RxAVIMMessage.prototype.serialize = function () {
        return this.content;
    };
    RxAVIMMessage.prototype.toJson = function () {
        return JSON.stringify(this);
    };
    return RxAVIMMessage;
}());
exports.RxAVIMMessage = RxAVIMMessage;
