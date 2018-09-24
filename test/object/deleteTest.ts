import * as chai from 'chai';
import { RxParseClient, RxParseObject, RxParseUser, RxParseACL, RxParseRole, RxParseQuery, ParseApp } from 'RxParse';
import * as init from "../utils/init";

init.init();

describe('RxObject', () => {
    before(() => {

    });
    it('RxAVObject#deleteOne', done => {
        let todo1: RxParseObject = new RxParseObject('RxTodo');
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
        let todo1: RxParseObject = new RxParseObject('RxTodo');
        todo1.set('title', '开会');
        todo1.set('time', '2016-12-03');
        todo1.set('reminder', new Date());

        let todo2: RxParseObject = new RxParseObject('RxTodo');
        todo2.set('title', '开会');
        todo2.set('time', '2016-12-03');
        todo2.set('reminder', new Date());


        let todo3: RxParseObject = new RxParseObject('RxTodo');
        todo3.set('title', '开会');
        todo3.set('time', '2016-12-03');
        todo3.set('reminder', new Date());

        let todo4: RxParseObject = new RxParseObject('RxTodo');
        todo4.set('title', '开会');
        todo4.set('time', '2016-12-03');
        todo4.set('reminder', new Date());

        let obja = [todo1, todo2, todo3, todo4];

        RxParseObject.saveAll(obja).flatMap(success => {
            return RxParseObject.deleteAll(obja);
        }).subscribe(deleted => {
            console.log(deleted);
        }, error => { }, () => {
            done();
        });
    });
});