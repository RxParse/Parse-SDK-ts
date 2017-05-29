import * as chai from 'chai';
import * as init from "../utils/init";
import { Observable, Subject } from 'rxjs';
import { RxAVClient, RxAVObject, RxAVUser, RxAVACL, RxAVRole, RxAVQuery, RxAVApp } from '../../src/RxLeanCloud';
let app = new RxAVApp({
    appId: `uay57kigwe0b6f5n0e1d4z4xhydsml3dor24bzwvzr57wdap`,
    appKey: `kfgz7jjfsk55r5a8a3y4ttd3je1ko11bkibcikonk32oozww`,
    server: {
        rtm: `wss://rtm51.leancloud.cn`,
    }
});
describe('RxObject', function () {
    before(() => {

    });

    it('Client#saveToMultipleApps', done => {
        let todo1: RxAVObject = new RxAVObject('RxTodo');
        todo1.set('app', 'app1');

        let todo2: RxAVObject = new RxAVObject('RxTodo', { appName: 'dev' });
        todo2.set('app', 'app2');

        let todo3: RxAVObject = new RxAVObject('RxTodo', { appName: 'default' });
        todo2.set('app', 'app1');

        Observable.merge(todo1.save(), todo2.save(), todo3.save()).subscribe(s => {
            console.log('Next: ' + s);
        }, error => { }, () => {
            done();
        });
    });
    it('Client#initWithoutConfig', done => {
        RxAVClient.init().add(app);
        done();
    });
});