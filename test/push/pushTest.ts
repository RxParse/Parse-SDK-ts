import * as chai from 'chai';
import * as init from "../utils/init";
import { RxAVClient, RxAVObject, RxAVUser, RxAVACL, RxAVRole, RxAVQuery, RxAVInstallation, RxAVPush } from '../../src/RxLeanCloud';
init.init();

describe('RxAVPush', function () {
    before(() => {
    });
    // it('RxAVPush#sendContent', done => {
    //     let query = new RxAVQuery('_Installation');
    //     query.equalTo('objectId', '66mJunJHFmuRjL14bnqGibxnWXNAXhUR');
    //     RxAVPush.sendContent('小果冻：爸爸，我想你了！', {
    //         query: query,
    //         prod: 'dev'
    //     }).subscribe(s => {
    //         done();
    //     });

    // });
    it('RxAVPush#open', done => {
        RxAVPush.open().subscribe(opend => {
            done();
        });
    });
    it('RxAVPush#received', done => {
        RxAVPush.open().flatMap(installation => {

            let testPush = new RxAVPush();
            testPush.alert = 'test pass-through';
            testPush.query.equalTo('installationId', installation.installationId);
            testPush.send().subscribe(sent => {
                console.log('sent,waiting for received...');
            });
            return RxAVPush.notification();
        }).subscribe(received => {
            console.log('received', received);
            done();
        });
    });
});