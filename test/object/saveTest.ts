import * as chai from 'chai';
import { RxAVClient, RxAVObject } from '../../src/RxLeanCloud';

describe('RxObject', function () {
    before(() => {
        RxAVClient.init({
            appId: 'uay57kigwe0b6f5n0e1d4z4xhydsml3dor24bzwvzr57wdap',
            appKey: 'kfgz7jjfsk55r5a8a3y4ttd3je1ko11bkibcikonk32oozww'
        });
    });
    it('RxAVObject#save', function (done) {
        let todo: RxAVObject = new RxAVObject('RxTodo');
        todo.set('title', '开会');
        todo.set('time', '2016-12-03');
        todo.save().subscribe(success => {
            if (success) console.log(todo.objectId);
            done();
        });
    });

    it('AVQuery.doCloudQuery', function (done) {
        done();
    });
});
