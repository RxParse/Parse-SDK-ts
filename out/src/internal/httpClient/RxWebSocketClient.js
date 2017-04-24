"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var rxjs_1 = require("rxjs");
var HttpResponse_1 = require("./HttpResponse");
var WebSocket = require('ws');
var RxWebSocketClient = (function () {
    function RxWebSocketClient(url, protocols) {
        this.listeners = {};
        this.url = url;
        this.protocols = protocols;
    }
    RxWebSocketClient.prototype.open = function () {
        var _this = this;
        var rtn = new Promise(function (resolve, reject) {
            _this.wsc = new WebSocket(_this.url, _this.protocols);
            _this.wsc.on('open', function () {
                console.log('opened');
                _this.socket = new rxjs_1.Subject();
                resolve(true);
            });
            _this.wsc.on('error', function (error) {
                console.log('error');
                reject(error);
            });
            _this.wsc.on('message', function (data, flags) {
                var rawResp = JSON.parse(data);
                console.log('websocket<=', data);
                for (var listener in _this.listeners) {
                    if (rawResp.i.toString() == listener) {
                        _this.listeners[listener](rawResp);
                        delete _this.listeners[listener];
                    }
                }
                _this.socket.next(rawResp);
            });
        });
        return rxjs_1.Observable.fromPromise(rtn);
    };
    RxWebSocketClient.prototype.execute = function (httpRequest) {
        var _this = this;
        var rawReq = JSON.stringify(httpRequest.data);
        this.wsc.send(rawReq);
        console.log('websocket=>', httpRequest.data);
        var rtn = new Promise(function (resolve, reject) {
            var fId = httpRequest.data.i.toString();
            _this.listeners[fId] = function (response) {
                var resp = new HttpResponse_1.HttpResponse();
                resp.body = response;
                resp.satusCode = 200;
                resolve(resp);
            };
        });
        return rxjs_1.Observable.fromPromise(rtn);
    };
    return RxWebSocketClient;
}());
exports.RxWebSocketClient = RxWebSocketClient;
