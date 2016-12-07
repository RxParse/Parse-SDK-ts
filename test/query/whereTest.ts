import * as chai from 'chai';
import { RxAVClient, RxAVObject, RxAVQuery } from '../../src/RxLeanCloud';


describe('RxObject', () => {
    before(() => {
        RxAVClient.init({
            appId: 'uay57kigwe0b6f5n0e1d4z4xhydsml3dor24bzwvzr57wdap',
            appKey: 'kfgz7jjfsk55r5a8a3y4ttd3je1ko11bkibcikonk32oozww',
            region: 'cn',
            log: true,
            pluginVersion: 2
        });
    });
    it('RxAVObject#save', done => {
        let query = new RxAVQuery('RxTodo');

        query.equalTo('title', 'father');
        query.notEqualTo('time', '1');

        query.find().subscribe(list => {
            list.forEach(obj => {
                console.log(obj.objectId);
            });
            console.log(list);
            done();
        }, error => {
            console.log(error);
            done();
        }, () => { });
    });
});