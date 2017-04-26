import * as chai from 'chai';
import { RxAVClient, RxAVObject, RxAVQuery, RxAVLiveQuery, RxAVRealtime } from '../../src/RxLeanCloud';
import { RxNodeJSWebSocketClient } from '../realtime/RxNodeJSWebSocketClient';

describe('RxAVLiveQuery', () => {
    before(done => {
        RxAVClient.init({
            appId: 'uay57kigwe0b6f5n0e1d4z4xhydsml3dor24bzwvzr57wdap',
            appKey: 'kfgz7jjfsk55r5a8a3y4ttd3je1ko11bkibcikonk32oozww',
            region: 'cn',
            log: true,
            server: {
                api: 'api.leancloud.cn',
                rtm: 'wss://rtm51.avoscloud.com/'
            },
            plugins: {
                websocket: new RxNodeJSWebSocketClient()
            }
        });

        let realtime = RxAVRealtime.instance;
        realtime.connect('junwu').subscribe(success => {
            done();
        });
    });
    it('RxAVLiveQuery#subscribe', done => {
        let query = new RxAVQuery('TodoLiveQuery');
        query.equalTo('name', 'livequery');
        let subscription = query.subscribe();
        subscription.subscribe(subs => {
            subs.on.subscribe(pushData => {
                console.log(pushData.scope, pushData.object.objectId);
                chai.assert.isNotNull(pushData.scope);
                chai.assert.isNotNull(pushData.object);
                done();
            });
        });

        //save a tofo for test
        let lqTodo = new RxAVObject('TodoLiveQuery');
        lqTodo.set('name', 'livequery');
        lqTodo.save().subscribe(success => {
            console.log('test data saved waiting for LiveQuery push data...', lqTodo.objectId);
        });
    });
});