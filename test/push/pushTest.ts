import * as chai from 'chai';
import * as init from "../utils/init";
import { RxParseClient, RxParseObject, RxParseUser, RxParseACL, RxParseRole, RxParseQuery, RxAVInstallation, RxParsePush } from 'RxParse';
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
        RxParsePush.open().subscribe(opend => {
            done();
        });
    });
    it('RxAVPush#received', done => {
        RxParsePush.open().flatMap(installation => {

            let testPush = new RxParsePush();
            testPush.alert = 'test pass-through';
            testPush.query.equalTo('installationId', installation.installationId);
            testPush.send().subscribe(sent => {
                console.log('sent,waiting for received...');
            });
            return RxParsePush.notification();
        }).subscribe(received => {
            console.log('received', received);
            done();
        });
    });
});