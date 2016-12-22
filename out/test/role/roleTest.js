"use strict";
var chai = require('chai');
var RxLeanCloud_1 = require('../../src/RxLeanCloud');
var random = require("../utils/random");
describe('RxAVRole', function () {
    before(function () {
        RxLeanCloud_1.RxAVClient.init({
            appId: 'uay57kigwe0b6f5n0e1d4z4xhydsml3dor24bzwvzr57wdap',
            appKey: 'kfgz7jjfsk55r5a8a3y4ttd3je1ko11bkibcikonk32oozww',
            region: 'cn',
            log: true,
            pluginVersion: 2
        });
    });
    it('RxAVRole#assign', function (done) {
        done();
        // let admin = RxAVRole.createWithoutData('5858169eac502e00670193bc');
        // admin.assign('58522f7e1b69e6006c7e1bd5', '58520289128fe1006d981b42').subscribe(success => {
        //     chai.assert.isTrue(success);
        //     done();
        // });
    });
    it('RxAVRole#init', function (done) {
        done();
        // let teamName = 'hua';
        // let admin = new RxAVRole(`${teamName}_admin`);
        // let customerManager = new RxAVRole(`${teamName}_customerManager`);
        // customerManager.save().subscribe(s => {
        //     console.log(customerManager.objectId);
        //     done();
        // });
        // o = o.merge(admin.save());
        // o.last().subscribe(s => {
        // });
        // //o = o.merge(customerManager.grant(admin));
        // o.subscribe(s => {
        //     console.log(s);
        //     console.log(admin.objectId);
        //     console.log(customerManager.objectId);
        // }, error => { }, () => {
        //     customerManager.grant(admin).subscribe(s => {
        //         done();
        //     });
        // });
        // let reception = new RxAVRole(`${teamName}_reception`);
        // let roomManager = new RxAVRole(`${teamName}_roomManager`);
        // let casher = new RxAVRole(`${teamName}_casher`);
    });
    it('RxAVRole#createWithPublicACL', function (done) {
        RxLeanCloud_1.RxAVUser.login('junwu', 'leancloud').map(function (user) {
            var randomRoleName = random.randomHexString(8);
            var testRole = new RxLeanCloud_1.RxAVRole(randomRoleName, new RxLeanCloud_1.RxAVACL());
            return testRole;
        }).subscribe(function (role) {
            role.save().subscribe(function (x) {
                console.log(role.objectId);
                done();
            });
        });
    });
    it('RxAVRole#createWithLogInedUser', function (done) {
        RxLeanCloud_1.RxAVUser.login('junwu', 'leancloud').map(function (user) {
            var randomRoleName = random.randomHexString(8);
            var testRole = new RxLeanCloud_1.RxAVRole(randomRoleName, new RxLeanCloud_1.RxAVACL(randomRoleName, user, 'SA'));
            return testRole;
        }).subscribe(function (role) {
            role.save().subscribe(function (x) {
                console.log(role.objectId);
                done();
            });
        });
    });
    it('RxAVRole#createTwoRolesWithACL', function (done) {
        RxLeanCloud_1.RxAVUser.login('junwu', 'leancloud').flatMap(function (user) {
            var randomRoleName1 = random.randomHexString(8);
            var randomRole1 = new RxLeanCloud_1.RxAVRole(randomRoleName1, new RxLeanCloud_1.RxAVACL(user), [user]);
            return randomRole1.save().map(function (s) {
                if (s)
                    return randomRole1;
            });
        }).flatMap(function (role1) {
            var randomRoleName2 = random.randomHexString(8);
            var randomRole2 = new RxLeanCloud_1.RxAVRole(randomRoleName2, new RxLeanCloud_1.RxAVACL(role1), null, [role1]);
            randomRole2.grant(role1);
            return randomRole2.save();
        }).subscribe(function (fs) {
            chai.assert.isTrue(fs);
            done();
        });
    });
});
