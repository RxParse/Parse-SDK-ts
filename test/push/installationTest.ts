import * as chai from 'chai';
import * as init from "../utils/init";
import * as random from "../utils/random";
import { RxParseClient, RxParseObject, RxParseUser, RxParseACL, RxParseRole, RxParseQuery, RxAVInstallation } from 'RxParse';
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
            return RxParseUser.logIn('junwu', 'leancloud');
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