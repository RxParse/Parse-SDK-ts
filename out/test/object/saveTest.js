"use strict";
var RxLeanCloud_1 = require('../../src/RxLeanCloud');
describe('RxObject', function () {
    before(function () {
        RxLeanCloud_1.RxAVClient.init({
            appId: 'uay57kigwe0b6f5n0e1d4z4xhydsml3dor24bzwvzr57wdap',
            appKey: 'kfgz7jjfsk55r5a8a3y4ttd3je1ko11bkibcikonk32oozww'
        });
    });
    it('RxAVObject#save', function (done) {
        var todo = new RxLeanCloud_1.RxAVObject('RxTodo');
        todo.set('title', '开会');
        todo.set('time', '2016-12-03');
        todo.save().subscribe(function (success) {
            if (success)
                console.log(todo.objectId);
            done();
        });
    });
    it('AVQuery.doCloudQuery', function (done) {
        done();
    });
});
