"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const rxjs_1 = require("rxjs");
const RxLeanCloud_1 = require("../../src/RxLeanCloud");
let client;
describe('RxObject', function () {
    before(() => {
        let app1 = new RxLeanCloud_1.RxAVApp({
            appId: `uay57kigwe0b6f5n0e1d4z4xhydsml3dor24bzwvzr57wdap`,
            appKey: `kfgz7jjfsk55r5a8a3y4ttd3je1ko11bkibcikonk32oozww`
        });
        let app2 = new RxLeanCloud_1.RxAVApp({
            appId: `1kz3x4fkhvo0ihk967hxdnlfk4etk754at9ciqspjmwidu1t`,
            appKey: `14t4wqop50t4rnq9e99j2b9cyg51o1232ppzzc1ia2u5e05e`,
            shortname: `dev`
        });
        client = RxLeanCloud_1.RxAVClient.init({
            log: true,
        }).add(app1).add(app2, false);
    });
    it('Object#saveToMultipleApps', done => {
        let todo1 = new RxLeanCloud_1.RxAVObject('RxTodo');
        todo1.set('app', 'app1');
        client.switch('dev');
        let todo2 = new RxLeanCloud_1.RxAVObject('RxTodo');
        todo2.set('app', 'app2');
        rxjs_1.Observable.merge(todo1.save(), todo2.save()).subscribe(s => {
            console.log('Next: ' + s);
        }, error => { }, () => {
            done();
        });
    });
});
