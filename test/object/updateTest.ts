import * as chai from 'chai';
import { ParseClient, RxParseObject, RxParseUser, RxParseACL, RxParseRole, RxParseQuery, ParseApp } from '../../src/RxParse';
import { init } from "../utils/init";
import { map, flatMap } from 'rxjs/operators';

describe('RxObject', () => {
    before(() => {
        init();
    });
    // it('RxAVObject#update', done => {

    //     let testObj = RxParseObject.createWithoutData('Todo', '592d3de90ce463006b430f49');
    //     testObj.set('content', 'testContent');
    //     testObj.save().subscribe(updated => {
    //         console.log(testObj.objectId);
    //         done();
    //     });
    // });
    // it('RxAVObject#fetch', done => {
    //     let testObj = RxParseObject.createWithoutData('Todo', '592d3de90ce463006b430f49');
    //     testObj.fetch().pipe(flatMap(obj => {
    //         testObj.set('content', 'testContent');
    //         return testObj.save();
    //     })).subscribe(updated => {
    //         console.log(testObj.objectId);
    //         done();
    //     });
    // });

});
