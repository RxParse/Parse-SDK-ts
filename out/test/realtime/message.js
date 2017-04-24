"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var chai = require("chai");
var RxLeanCloud_1 = require("../../src/RxLeanCloud");
describe('AVRealtime', function () {
    before(function (done) {
        RxLeanCloud_1.RxAVClient.init({
            appId: 'uay57kigwe0b6f5n0e1d4z4xhydsml3dor24bzwvzr57wdap',
            appKey: 'kfgz7jjfsk55r5a8a3y4ttd3je1ko11bkibcikonk32oozww',
            region: 'cn',
            log: true,
            pluginVersion: 2
        });
        var realtime = RxLeanCloud_1.RxAVRealtime.instance;
        realtime.connect('junwu').subscribe(function (success) {
            done();
        });
    });
    it('AVRealtime#receive', function (done) {
        var realtime = RxLeanCloud_1.RxAVRealtime.instance;
        RESTSendMessage('test');
        realtime.messages.subscribe(function (message) {
            console.log(message.serialize());
            done();
        });
    });
    it('AVRealtime#send', function (done) {
        var realtime = RxLeanCloud_1.RxAVRealtime.instance;
        realtime.send('58be1f5392509726c3dc1c8b', {
            type: 'text',
            text: '我是个测试消息'
        }).subscribe(function (msg) {
            chai.assert.isNotNull(msg.id);
            done();
        });
    });
});
function RESTSendMessage(text) {
    var request = require("request");
    var textMessage = {
        _lctype: -1,
        _lctext: text
    };
    var options = {
        method: 'POST',
        url: 'https://api.leancloud.cn/1.1/rtm/messages',
        headers: {
            'postman-token': '6388b3fe-1943-17d4-98af-65cb010f3351',
            'cache-control': 'no-cache',
            'content-type': 'application/json',
            'x-lc-key': 'o9sd6j9d30kukvljnhpwv5in73ljrmg95m5csl588917kp8s,master',
            'x-lc-id': 'uay57kigwe0b6f5n0e1d4z4xhydsml3dor24bzwvzr57wdap'
        },
        body: {
            from_peer: '1a',
            message: JSON.stringify(textMessage),
            conv_id: '58be1f5392509726c3dc1c8b',
            transient: false
        },
        json: true
    };
    request(options, function (error, response, body) {
        if (error)
            throw new Error(error);
        console.log(body);
    });
}
