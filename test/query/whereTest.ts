import * as chai from 'chai';
import { ParseClient, RxParseObject, RxParseQuery } from 'RxParse';
import * as init from "../utils/init";

describe('RxAVQuery', () => {
    before(() => {
    });
    it('RxAVQuery#where', done => {
        let query = new RxParseQuery('RxTodo');

        query.equalTo('title', '开会');
        query.notEqualTo('time', '1');

        query.find().subscribe(list => {
            done();
        }, error => {
            console.log(error);
            done();
        }, () => { });
    });
    it('RxAVQuery#WithoutResult', done => {
        let query = new RxParseQuery('RxTodo');

        query.equalTo('title', 'fatherXXX');

        query.find().subscribe(list => {
            console.log(list);
            chai.assert.isTrue(list.length == 0);
            done();
        }, error => {
            console.log(error);
            done();
        }, () => { });
    });
    it('RxAVQuery#seek', done => {
        let uiList: Array<{ id: string, title: string }> = [];
        let query = new RxParseQuery('RxTodo');

        query.equalTo('title', '开会');

        query.seek().map(obj => {
            return {
                id: obj.objectId,
                title: obj.get('title')
            }
        }).subscribe(tuple => {
            uiList.push(tuple);
            console.log('tuple', tuple);
            chai.assert.isTrue(tuple != null);
        }, error => { }, () => {
            done();
        });
    });
});