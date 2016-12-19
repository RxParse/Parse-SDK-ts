"use strict";
var chai = require('chai');
var RxLeanCloud_1 = require('../../src/RxLeanCloud');
describe('RxAVQuery', function () {
    before(function () {
        RxLeanCloud_1.RxAVClient.init({
            appId: 'uay57kigwe0b6f5n0e1d4z4xhydsml3dor24bzwvzr57wdap',
            appKey: 'kfgz7jjfsk55r5a8a3y4ttd3je1ko11bkibcikonk32oozww',
            region: 'cn',
            log: true,
            pluginVersion: 2
        });
    });
    it('RxAVQuery#where', function (done) {
        var query = new RxLeanCloud_1.RxAVQuery('RxTodo');
        query.equalTo('title', 'father');
        query.notEqualTo('time', '1');
        query.find().subscribe(function (list) {
            list.forEach(function (obj) {
                console.log('obj.objectId', obj.objectId);
                console.log('obj.get(xx)', obj.get('xx'));
                console.log('obj.get(title)', obj.get('title'));
            });
            console.log(list);
            done();
        }, function (error) {
            console.log(error);
            done();
        }, function () { });
    });
    it('RxAVQuery#whereWithoutResult', function (done) {
        var query = new RxLeanCloud_1.RxAVQuery('RxTodo');
        query.equalTo('title', 'fatherxxx');
        query.find().subscribe(function (list) {
            console.log(list);
            chai.assert.isTrue(list.length == 0);
            done();
        }, function (error) {
            console.log(error);
            done();
        }, function () { });
    });
});
