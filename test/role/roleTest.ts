import * as chai from 'chai';
import { RxAVClient, RxAVObject, RxAVQuery, RxAVRole, RxAVUser, RxAVACL } from '../../src/RxLeanCloud';
import * as random from "../utils/random";

describe('RxAVRole', () => {
    before(() => {
        RxAVClient.init({
            appId: 'uay57kigwe0b6f5n0e1d4z4xhydsml3dor24bzwvzr57wdap',
            appKey: 'kfgz7jjfsk55r5a8a3y4ttd3je1ko11bkibcikonk32oozww',
            region: 'cn',
            log: true,
            pluginVersion: 2
        });
    });
    it('RxAVRole#assign', done => {
        done();
        // let admin = RxAVRole.createWithoutData('5858169eac502e00670193bc');
        // admin.assign('58522f7e1b69e6006c7e1bd5', '58520289128fe1006d981b42').subscribe(success => {
        //     chai.assert.isTrue(success);
        //     done();
        // });
    });
    it('RxAVRole#init', done => {
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
    it('RxAVRole#createWithPublicACL', done => {
        RxAVUser.login('junwu', 'leancloud').map(user => {
            let randomRoleName = random.randomHexString(8);
            let testRole = new RxAVRole(randomRoleName, new RxAVACL());
            return testRole;
        }).subscribe(role => {
            role.save().subscribe(x => {
                console.log(role.objectId);
                done();
            });
        });
    });

    it('RxAVRole#createTwoRolesWithACL', done => {
        RxAVUser.login('junwu', 'leancloud').flatMap<RxAVRole>(user => {
            let randomRoleName1 = random.randomHexString(8);
            let randomRole1 = new RxAVRole(randomRoleName1, new RxAVACL(user), [user]);
            return randomRole1.save().map(s => {
                if (s)
                    return randomRole1;
            });
        }).flatMap<boolean>(role1 => {
            let randomRoleName2 = random.randomHexString(8);
            let randomRole2 = new RxAVRole(randomRoleName2, new RxAVACL(role1), null, [role1]);
            randomRole2.grant(role1);
            return randomRole2.save();
        }).subscribe(fs => {
            chai.assert.isTrue(fs);
            done();
        });
    });
});