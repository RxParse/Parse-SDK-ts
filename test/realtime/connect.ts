import * as chai from 'chai';
import { RxAVClient, RxAVObject, RxAVQuery, RxAVRole, RxAVUser, RxAVACL, RxAVRealtime } from '../../src/RxLeanCloud';
import * as random from "../utils/random";
describe('AVRealtime', () => {
    before(() => {
        RxAVClient.init({
            appId: 'uay57kigwe0b6f5n0e1d4z4xhydsml3dor24bzwvzr57wdap',
            appKey: 'kfgz7jjfsk55r5a8a3y4ttd3je1ko11bkibcikonk32oozww',
            region: 'cn',
            log: true,
            pluginVersion: 2
        });
    });

    it('AVRealtime#connect', done => {
        let realtime = new RxAVRealtime();
        realtime.connect('junwu').subscribe(success => {
            done();
        });
    });
});