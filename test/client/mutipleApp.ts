import * as chai from 'chai';
import * as init from "../utils/init";
import { Observable, Subject } from 'rxjs';
import { RxAVClient, RxAVObject, RxAVUser, RxAVACL, RxAVRole, RxAVQuery, RxAVApp } from '../../src/RxLeanCloud';

describe('RxObject', function () {
    before(() => {

    });

    it('Object#saveToMultipleApps', done => {
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
});