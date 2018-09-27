import * as chai from 'chai';
import { ParseClient, RxParseObject, RxParseQuery, RxParseRole, RxParseUser, RxParseACL } from '../../src/RxParse';
import * as random from "../utils/random";
import * as init from "../utils/init";
import { map, flatMap } from 'rxjs/operators';

describe('RxAVRole', () => {
    before(() => {
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
        RxParseUser.logIn('junwu', 'leancloud').pipe(flatMap(user => {
            let randomRoleName = random.randomHexString(8);
            let testRole = new RxParseRole(randomRoleName, new RxParseACL(user));
            return testRole.save();
        })).subscribe(s => {
            chai.assert.isTrue(s);
            done();
        });
    });
});