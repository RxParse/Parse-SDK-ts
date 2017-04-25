"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai = require("chai");
const RxLeanCloud_1 = require("../../src/RxLeanCloud");
describe('RxAVQuery', () => {
    before(() => {
        RxLeanCloud_1.RxAVClient.init({
            appId: 'uay57kigwe0b6f5n0e1d4z4xhydsml3dor24bzwvzr57wdap',
            appKey: 'kfgz7jjfsk55r5a8a3y4ttd3je1ko11bkibcikonk32oozww',
            region: 'cn',
            log: true,
            pluginVersion: 2
        });
    });
    it('RxAVQuery#where', done => {
        let query = new RxLeanCloud_1.RxAVQuery('RxTodo');
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
        let query = new RxLeanCloud_1.RxAVQuery('RxTodo');
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
