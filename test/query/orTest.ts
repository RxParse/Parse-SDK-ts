import * as chai from 'chai';
import { RxAVClient, RxAVObject, RxAVQuery } from '../../src/RxLeanCloud';

describe('RxAVQuery', () => {
    before(() => {
        RxAVClient.init({
            appId: 'uay57kigwe0b6f5n0e1d4z4xhydsml3dor24bzwvzr57wdap',
            appKey: 'kfgz7jjfsk55r5a8a3y4ttd3je1ko11bkibcikonk32oozww',
            region: 'cn',
            log: true,
            pluginVersion: 2
        });
    });
    it('RxAVQuery#or', done => {
        let dateQuery = new RxAVQuery('RxTodo');
        dateQuery.equalTo('open', false);

        let statusQuery = new RxAVQuery('RxTodo');
        statusQuery.equalTo('time', '2016-12-07');

        let mixQuery = RxAVQuery.or(dateQuery, statusQuery);

        mixQuery.find().subscribe(list => {
            console.log(list);
            chai.assert.isTrue(list.length > 0);
            done();
        });
    });
});