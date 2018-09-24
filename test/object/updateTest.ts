import * as chai from 'chai';
import { RxParseClient, RxParseObject, RxParseUser, RxParseACL, RxParseRole, RxParseQuery, ParseApp } from 'RxParse';
import * as init from "../utils/init";

import * as Parse from 'RxParse';

init.init();
describe('RxObject', () => {
    before(() => {
        
    });
    it('RxAVObject#update', done => {

        let testObj = Parse.Object.createWithoutData('Todo', '592d3de90ce463006b430f49');
        testObj.set('content', 'testContent');
        testObj.save().subscribe(updated => {
            console.log(testObj.objectId);
            done();
        });
    });
    it('RxAVObject#fetch', done => {
        let testObj = RxParseObject.createWithoutData('Todo', '592d3de90ce463006b430f49');
        testObj.fetch().flatMap(obj => {
            testObj.set('content', 'testContent');
            return testObj.save();
        }).subscribe(updated => {
            console.log(testObj.objectId);
            done();
        });
    });

});
