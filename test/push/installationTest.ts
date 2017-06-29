import * as chai from 'chai';
import * as init from "../utils/init";
import * as random from "../utils/random";
import { RxAVClient, RxAVObject, RxAVUser, RxAVACL, RxAVRole, RxAVQuery, RxAVInstallation } from '../../src/RxLeanCloud';
init.init();
describe('RxAVInstallation', function () {
    before(() => {

    });
    it('RxAVInstallation#userActivate', done => {
        let installation = new RxAVInstallation();
        installation.deviceType = 'ios';
        installation.deviceToken = random.newToken();
        installation.channels = ['public', 'fuck'];
        installation.save().flatMap(insSaved => {
            return RxAVUser.logIn('junwu', 'leancloud');
        }).flatMap(logedIn => {
            console.log('logedIn');
            return logedIn.activate(installation, true);
        }).subscribe(bound => {
            done();
        }, error => {
            console.log(error);
        });
    });
});