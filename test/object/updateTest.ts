import * as chai from 'chai';
import { RxAVClient, RxAVObject, RxAVUser, RxAVACL, RxAVRole, RxAVQuery, RxAVApp } from '../../src/RxLeanCloud';
import * as init from "../utils/init";

init.init();
describe('RxObject', () => {
    before(() => {
        
    });

    it('RxAVObject#update', done => {
        let testObj = RxAVObject.createWithoutData('Todo', '592d3de90ce463006b430f49');
        testObj.set('content', 'testContent');
        testObj.save().subscribe(updated => {
            console.log(testObj.objectId);
            done();
        });
    });
    it('RxAVObject#fetch', done => {
        let testObj = RxAVObject.createWithoutData('Todo', '592d3de90ce463006b430f49');
        testObj.fetch().flatMap(obj => {
            testObj.set('content', 'testContent');
            return testObj.save();
        }).subscribe(updated => {
            console.log(testObj.objectId);
            done();
        });
    });

});
