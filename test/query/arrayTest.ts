import * as chai from 'chai';
import { RxAVClient, RxAVObject, RxAVUser, RxAVACL, RxAVRole, RxAVQuery, RxAVApp } from '../../src/RxLeanCloud';
import * as init from "../utils/init";

init.init();
describe('RxObject', function () {
    before(() => {

    });

    it('RxAVQuery#decodeArray', done => {
        let todo = new RxAVObject('Todo');
        todo.add('testDates', new Date());
        todo.add('testDates', new Date());

        todo.save().flatMap(saved => {
            let query = new RxAVQuery('Todo');
            query.equalTo('objectId', todo.objectId);
            return query.find();
        }).subscribe(list => {
            chai.assert.isArray(list);
            let queriedTodo = list[0];
            let testDates = queriedTodo.get('testDates') as Array<Date>;
            let dateValue1 = testDates[0];
            console.log('dateValue1', dateValue1);
            chai.assert.isTrue(dateValue1 instanceof Date);
            done();
        });
    });

    it('RxAVQuery#addRange_number', done => {
        let todo = new RxAVObject('Todo');
        todo.add('testNumbers', 1);
        todo.add('testNumbers', 1);

        todo.save().flatMap(saved => {
            let query = new RxAVQuery('Todo');
            query.equalTo('objectId', todo.objectId);
            return query.find();
        }).subscribe(list => {
            chai.assert.isArray(list);
            let queriedTodo = list[0];
            let testNumbers = queriedTodo.get('testNumbers') as Array<number>;
            console.log('testNumbers', testNumbers);
            let numberValue1 = testNumbers[0];
            console.log('numberValue1', numberValue1);
            chai.assert.isTrue(typeof numberValue1 == 'number');
            done();
        });
    });

});
