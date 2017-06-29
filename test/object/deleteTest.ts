import * as chai from 'chai';
import { RxAVClient, RxAVObject, RxAVUser, RxAVACL, RxAVRole, RxAVQuery, RxAVApp } from '../../src/RxLeanCloud';
import * as init from "../utils/init";

init.init();

describe('RxObject', () => {
    before(() => {

    });
    it('RxAVObject#deleteOne', done => {
        let todo1: RxAVObject = new RxAVObject('RxTodo');
        todo1.set('title', '开会');
        todo1.set('time', '2016-12-03');
        todo1.set('reminder', new Date());

        todo1.save().flatMap(success => {
            return todo1.delete();
        }).subscribe(deleted => {
            console.log(deleted);
            done();
        });
    });
    it('RxAVObject#deleteAll', done => {
        let todo1: RxAVObject = new RxAVObject('RxTodo');
        todo1.set('title', '开会');
        todo1.set('time', '2016-12-03');
        todo1.set('reminder', new Date());

        let todo2: RxAVObject = new RxAVObject('RxTodo');
        todo2.set('title', '开会');
        todo2.set('time', '2016-12-03');
        todo2.set('reminder', new Date());


        let todo3: RxAVObject = new RxAVObject('RxTodo');
        todo3.set('title', '开会');
        todo3.set('time', '2016-12-03');
        todo3.set('reminder', new Date());

        let todo4: RxAVObject = new RxAVObject('RxTodo');
        todo4.set('title', '开会');
        todo4.set('time', '2016-12-03');
        todo4.set('reminder', new Date());

        let obja = [todo1, todo2, todo3, todo4];

        RxAVObject.saveAll(obja).flatMap(success => {
            return RxAVObject.deleteAll(obja);
        }).subscribe(deleted => {
            console.log(deleted);
        }, error => { }, () => {
            done();
        });
    });
});