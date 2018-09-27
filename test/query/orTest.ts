import * as chai from 'chai';
import { ParseClient, RxParseObject, RxParseUser, RxParseACL, RxParseRole, RxParseQuery, ParseApp } from '../../src/RxParse';
import * as init from "../utils/init";

describe('RxAVQuery', () => {
    before(() => {
    });
    it('RxAVQuery#or', done => {
        let dateQuery = new RxParseQuery('RxTodo');
        dateQuery.equalTo('open', false);

        let statusQuery = new RxParseQuery('RxTodo');
        statusQuery.equalTo('time', '2016-12-07');

        let mixQuery = RxParseQuery.or(dateQuery, statusQuery);

        mixQuery.find().subscribe(list => {
            console.log(list);
            chai.assert.isTrue(list.length > 0);
            done();
        });
    });
});