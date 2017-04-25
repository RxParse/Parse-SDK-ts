"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const RxLeanCloud_1 = require("../../src/RxLeanCloud");
describe('AVRealtime', () => {
    before(() => {
        RxLeanCloud_1.RxAVClient.init({
            appId: 'uay57kigwe0b6f5n0e1d4z4xhydsml3dor24bzwvzr57wdap',
            appKey: 'kfgz7jjfsk55r5a8a3y4ttd3je1ko11bkibcikonk32oozww',
            region: 'cn',
            log: true,
            pluginVersion: 2
        });
    });
    it('AVRealtime#connect', done => {
        let realtime = new RxLeanCloud_1.RxAVRealtime();
        realtime.connect('junwu').subscribe(success => {
            done();
        });
    });
});
