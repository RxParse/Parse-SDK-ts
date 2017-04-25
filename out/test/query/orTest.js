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
    it('RxAVQuery#or', done => {
        let dateQuery = new RxLeanCloud_1.RxAVQuery('RxTodo');
        dateQuery.equalTo('open', false);
        let statusQuery = new RxLeanCloud_1.RxAVQuery('RxTodo');
        statusQuery.equalTo('time', '2016-12-07');
        let mixQuery = RxLeanCloud_1.RxAVQuery.or(dateQuery, statusQuery);
        mixQuery.find().subscribe(list => {
            console.log(list);
            chai.assert.isTrue(list.length > 0);
            done();
        });
    });
});
