"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const RxLeanCloud_1 = require("../../src/RxLeanCloud");
describe('RxAVPush', function () {
    before(() => {
        RxLeanCloud_1.RxAVClient.init({
            appId: '6j2LjkhAnnDTeefTLFQTFJXx-gzGzoHsz',
            appKey: 'mrChsHGwIAytLHopODLpqiHo',
            region: 'cn',
            log: true,
            pluginVersion: 2
        });
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
    it('RxAVPush#sendTo', done => {
        done();
    });
});
