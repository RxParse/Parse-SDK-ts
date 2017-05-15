import * as chai from 'chai';
import { RxAVClient, RxAVObject, RxAVQuery } from '../../src/RxLeanCloud';
import * as init from "../utils/init";

describe('RxAVQuery', () => {
    before(() => {
    });
    it('RxAVQuery#where', done => {
        let query = new RxAVQuery('RxTodo');

        query.equalTo('title', 'father');
        query.notEqualTo('time', '1');

        query.find().subscribe(list => {
            list.forEach(obj => {
                console.log('obj.objectId', obj.objectId);
                console.log('obj.get(xx)', obj.get('xx'));
                console.log('obj.get(title)', obj.get('title'));
            });
            console.log(list);
            done();
        }, error => {
            console.log(error);
            done();
        }, () => { });
    });
    it('RxAVQuery#whereWithoutResult', done => {
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
});