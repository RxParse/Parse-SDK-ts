import * as chai from 'chai';
import * as init from "../utils/init";
import { RxAVClient, RxAVObject, RxAVQuery, RxAVRole, RxAVUser, RxAVACL, RxAVRealtime, RxAVApp, RxAVIMHistoryIterator } from '../../src/RxLeanCloud';
import * as random from "../utils/random";
import { NodeJSWebSocketClient } from './NodeJSWebSocketClient';

init.init();

let realtime = new RxAVRealtime();

describe('AVRealtime', () => {
    before(done => {
        realtime.connect('junwu').subscribe(success => {
            done();
        });
    });

    it('AVRealtime#receive', done => {
        RESTSendMessage('test');
        console.log('realtime', realtime);
        realtime.onMessage.subscribe(message => {
            console.log(message.serialize());
            let msgMap = message.toJson();
            console.log('msgMap', msgMap);
            done();
        });
    });

    it('AVRealtime#receiveTranseint', done => {
        realtime.add('5930e9738d6d8100589eb4cd', ['weichi']).subscribe(success => {
            console.log('waiting for message received...');
            realtime.onMessage.subscribe(message => {
                console.log(message.serialize());
                let msgMap = message.toJson();
                console.log('msgMap', msgMap);
                done();
            });
        });
    });

    it('AVRealtime#sendText', done => {
        realtime.send('5a0c194c73daf8f6a84b891f', {
            type: 'text',
            text: '111213',
        }).subscribe(msg => {
            chai.assert.isNotNull(msg.id);
            done();
        });
    });
    it('AVRealtime#sendEmoji', done => {
        realtime.send('5a0c194c73daf8f6a84b891f', {
            type: 2,
            Ecode: 'u2123',
        }).subscribe(msg => {
            chai.assert.isNotNull(msg.id);
            done();
        });
    });
    it('AVRealtime#history.next', done => {
        let history = realtime.history('5a0c194c73daf8f6a84b891f');
        history.startedAt = new Date(1510791323186);
        
        history.next().subscribe(messages => {
            console.log('nextIndexMessageId', history.nextIndexMessageId);
            messages.forEach(m => {
                let json = m.toJson();
                console.log('json', json);
            });
            done();
        });
    });
    it('AVRealtime#history.nextx2', done => {
        let history = realtime.history('5a0c194c73daf8f6a84b891f');
        history.startedAt = new Date(1510791323186);
        history.limit = 2;
        history.next().flatMap(messages1 => {
            messages1.forEach(m => {
                let json = m.toJson();
                console.log('json1', json);
            });
            return history.next();
        }).subscribe(messages => {
            messages.forEach(m => {
                let json = m.toJson();
                console.log('json2', json);
            });
            done();
        });
    });
    it('AVRealtime#history.previous', done => {
        let history = realtime.history('5a0c194c73daf8f6a84b891f');
        history.limit = 2;
        history.previous().subscribe(messages => {
            messages.forEach(m => {
                let json = m.toJson();
                console.log('json', json);
            });
            done();
        });
    });

    it('AVRealtime#history.previousx2', done => {
        let history = realtime.history('5a0c194c73daf8f6a84b891f');
        history.limit = 2;
        history.previous().flatMap(messages1 => {
            messages1.forEach(m => {
                let json = m.toJson();
                console.log('json1', json);
            });
            return history.previous();
        }).subscribe(messages => {
            messages.forEach(m => {
                let json = m.toJson();
                console.log('json2', json);
            });
            done();
        });
    });

});

function RESTSendMessage(text: string, attrs?: any) {
    var request = require("request");
    let textMessage = {
        _lctype: -1,
        _lctext: text
    };

    let options = {
        method: 'POST',
        url: 'https://api.leancloud.cn/1.1/rtm/messages',
        headers:
            {
                'postman-token': '6388b3fe-1943-17d4-98af-65cb010f3351',
                'cache-control': 'no-cache',
                'content-type': 'application/json',
                'x-lc-key': 'o9sd6j9d30kukvljnhpwv5in73ljrmg95m5csl588917kp8s,master',
                'x-lc-id': 'uay57kigwe0b6f5n0e1d4z4xhydsml3dor24bzwvzr57wdap'
            },
        body:
            {
                from_peer: '1a',
                message: JSON.stringify(textMessage),
                conv_id: '58be1f5392509726c3dc1c8b',
                transient: false
            },
        json: true
    };

    request(options, function (error, response, body) {
        if (error) throw new Error(error);

        console.log(body);
    });
}