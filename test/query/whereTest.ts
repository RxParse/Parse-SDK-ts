import * as chai from 'chai';
import { RxAVClient, RxAVObject, RxAVQuery } from '../../src/RxLeanCloud';
import * as init from "../utils/init";

describe('RxAVQuery', () => {
    before(() => {
    });
    it('RxAVQuery#where', done => {
        let query = new RxAVQuery('RxTodo');

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
        let query = new RxAVQuery('RxTodo');

        query.equalTo('title', 'fatherxxx');

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
        let query = new RxAVQuery('RxTodo');

        query.equalTo('title', '开会');

        query.seek().map(obj => {
            return {
                id: obj.objectId,
                title: obj.get('title')
            }
        }).subscribe(tupple => {
            uiList.push(tupple);
            console.log('tupple', tupple);
            chai.assert.isTrue(tupple != null);
        }, error => { }, () => {
            done();
        });
    });
});