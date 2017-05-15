import * as chai from 'chai';
import { RxAVClient, RxAVObject, RxAVQuery, RxAVApp } from '../../src/RxLeanCloud';
import * as init from "../utils/init";

describe('RxAVQuery', () => {
    before(() => {
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