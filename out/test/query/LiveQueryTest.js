"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai = require("chai");
const RxLeanCloud_1 = require("../../src/RxLeanCloud");
const NodeJSWebSocketClient_1 = require("../realtime/NodeJSWebSocketClient");
describe('RxAVLiveQuery', () => {
    before(done => {
        let app = new RxLeanCloud_1.RxAVApp({
            appId: `uay57kigwe0b6f5n0e1d4z4xhydsml3dor24bzwvzr57wdap`,
            appKey: `kfgz7jjfsk55r5a8a3y4ttd3je1ko11bkibcikonk32oozww`,
            server: {
                rtm: `wss://rtm51.leancloud.cn`
            }
        });
        RxLeanCloud_1.RxAVClient.init({
            log: true,
            plugins: {
                websocket: new NodeJSWebSocketClient_1.NodeJSWebSocketClient()
            }
        }).add(app);
        // let realtime = RxAVRealtime.instance;
        // realtime.connect('junwu').subscribe(success => {
        // });
        done();
    });
    it('RxAVLiveQuery#subscribe', done => {
        let query = new RxLeanCloud_1.RxAVQuery('TodoLiveQuery');
        query.equalTo('name', 'livequery');
        let subscription = query.subscribe();
        subscription.flatMap(subs => {
            //save a tofo for test
            let todo = new RxLeanCloud_1.RxAVObject('TodoLiveQuery');
            todo.set('name', 'livequery');
            todo.save().subscribe(result => {
                console.log('save a tofo for test,', result);
            });
            console.log('subs', subs);
            return subs.on.asObservable();
        }).subscribe(pushData => {
            console.log('pushData.scope', pushData.scope, 'pushData.object.objectId', pushData.object.objectId);
            chai.assert.isNotNull(pushData.scope);
            chai.assert.isNotNull(pushData.object);
            done();
        });
    });
});
