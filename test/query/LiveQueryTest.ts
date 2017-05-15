import * as chai from 'chai';
import { Observable } from 'rxjs';
import { RxAVClient, RxAVObject, RxAVQuery, RxAVLiveQuery, RxAVRealtime, RxAVApp } from '../../src/RxLeanCloud';
import * as init from "../utils/init";

describe('RxAVLiveQuery', () => {
    before(done => {
        done();
    });
    it('RxAVLiveQuery#subscribe', done => {
        let query = new RxAVQuery('TodoLiveQuery');
        query.equalTo('tag', 'livequery');
        let subscription = query.subscribe();
        subscription.flatMap(subs => {
            //save a tofo for test
            let todo = new RxAVObject('TodoLiveQuery');
            todo.set('tag', 'livequery');
            todo.save().subscribe(result => {
                console.log('save a todo for test,', result);
            });
            console.log('subs', subs);
            return subs.on;
        }).subscribe(pushData => {
            console.log('pushData.scope', pushData.scope, 'pushData.object.objectId', pushData.object.objectId);
            chai.assert.isNotNull(pushData.scope);
            chai.assert.isNotNull(pushData.object);
            done();
        });
    });
    it('RxAVLiveQuery#singleton', done => {
        let query1 = new RxAVQuery('TodoLiveQuery');
        query1.equalTo('name', 'livequery');

        let subscription1: RxAVLiveQuery = null;
        let subscription2: RxAVLiveQuery = null;

        query1.subscribe().flatMap(subs => {
            subscription1 = subs;
            let query2 = new RxAVQuery('TodoLiveQuery');
            query2.equalTo('name', 'livequery');
            return query2.subscribe();
        }).subscribe(subs2 => {
            subscription2 = subs2;
            console.log('subscription1', subscription1);
            console.log('subscription2', subscription2);
            chai.assert.isTrue(subscription1.id == subscription2.id);
            chai.assert.isTrue(subscription1 === subscription2);
            done();
        });
    });
    it('RxAVLiveQuery#sameConnection', done => {
        let query1 = new RxAVQuery('TodoLiveQuery');
        query1.equalTo('name', 'livequery');

        let subscription1: RxAVLiveQuery = null;
        let subscription2: RxAVLiveQuery = null;
        let r = 0;
        query1.subscribe().flatMap(subs1 => {
            subscription1 = subs1;
            let query2 = new RxAVQuery('TodoLiveQuery');
            query2.equalTo('title', 'livequery');
            return query2.subscribe();
        }).flatMap(subs2 => {
            subscription2 = subs2;
            // subscription1.on.subscribe(pushdata => {
            //     console.log('subscription1', pushdata.scope, pushdata.object);
            // });
            // subscription2.on.subscribe(pushdata2 => {
            //     console.log('subscription2', pushdata2.scope, pushdata2.object);
            // });
            //save a tofo for test
            let todo = new RxAVObject('TodoLiveQuery');
            todo.set('name', 'livequery');
            todo.set('title', 'livequery');
            todo.save().subscribe(result => {
                console.log('save a todo for test,', result);
            });
            // let s1 = subscription1.RxWebSocketController.onMessage.subscribe(message => {
            //     console.log('111', message);
            // });
            // let s2 = subscription2.RxWebSocketController.onMessage.subscribe(message => {
            //     console.log('222', message);
            // });
            // let merged = Observable.merge(subscription1.on, subscription2.on);
            // let subscription = merged.subscribe(
            //     x => { console.log('Next: %s', x); },
            //     err => { console.log('Error: %s', err); }, () => { });
            return Observable.merge(subscription1.on, subscription2.on)
            //return Observable.merge([false])
        }).subscribe(pushData => {
            r++;
            console.log('r', r);
            if (r == 2) {
                done();
            }
        });
    });

    // it('rxjs#fuck', done => {
    //     let source = Observable.from([1, 2, 3])
    //     source.subscribe(val => console.log('obs1', val));
    //     source.subscribe(val => console.log('obs2', val));
    // });
    // it('AVRealtime#rxMessage', done => {
    //     RxAVRealtime.instance.open().subscribe(success => {
    //         RxAVRealtime.instance.RxWebSocketController.onMessage.subscribe(val => console.log('obs1', val));
    //         RxAVRealtime.instance.RxWebSocketController.onMessage.subscribe(val => console.log('obs2', val));
    //         RxAVRealtime.instance.RxWebSocketController.websocketClient.send(`{"cmd":"login","appId":"uay57kigwe0b6f5n0e1d4z4xhydsml3dor24bzwvzr57wdap","installationId":"3hbbVAp2Oe","service":1,"i":-65535}`);
    //     });
    // });
    // it('rxjs#Merge', done => {
    //     let source1 = Observable.of(1, 2, 3);

    //     let source3 = Observable.of(4, 5, 6);

    //     let merged = Observable.merge(source1, source3);

    //     let subscription = merged.subscribe(
    //         x => { console.log('Next: %s', x); },
    //         err => { console.log('Error: %s', err); }, () => { });
    // });
});