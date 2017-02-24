"use strict";
var RxLeanCloud_1 = require('../../src/RxLeanCloud');
describe('RxAVInstallation', function () {
    before(function () {
        RxLeanCloud_1.RxAVClient.init({
            appId: '6j2LjkhAnnDTeefTLFQTFJXx-gzGzoHsz',
            appKey: 'mrChsHGwIAytLHopODLpqiHo',
            region: 'cn',
            log: true,
            pluginVersion: 2
        });
    });
    it('RxAVInstallation#save', function (done) {
        var installation = new RxLeanCloud_1.RxAVInstallation();
        installation.deviceType = 'ios';
        installation.deviceToken = '0dd8d2697841d7292dc6cce7ba8172ba77ae62f454ecf5974830e0469431efe9';
        installation.channels = ['public', 'fuck'];
        installation.save().subscribe(function (s) {
            done();
        });
    });
    // it('RxAVInstallation#emptyBinding', done => {
    //     RxAVUser.logIn('18612438929', 'leancloud').flatMap(user => {
    //         user.remove(user.installationKey);
    //         return user.save();
    //     }).subscribe(s => {
    //         done();
    //     });
    // });
    // it('RxAVInstallation#fetchBinding', done => {
    //     RxAVUser.logIn('18612438929', 'leancloud').flatMap(user => {
    //         return user.fetchRelation(user.installationKey, new RxAVInstallation().className);
    //     }).subscribe(s => {
    //         console.log(s);
    //         done();
    //     });
    // });
    // it('RxAVInstallation#user.activate', done => {
    //     let installation = RxAVObject.createSubclass(RxAVInstallation, '1CNNyEgF0Kc8qhoSPl94uVw04P4LDFaV');
    //     RxAVUser.logIn('18612438929', 'leancloud').flatMap(user => {
    //         return user.activate(installation, false);
    //     }).subscribe(s => {
    //         done();
    //     });
    // });
});
