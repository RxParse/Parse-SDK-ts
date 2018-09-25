import * as chai from 'chai';
import * as init from "../utils/init";
import * as random from "../utils/random";
import { ParseClient, RxParseObject, RxParseUser, RxParseACL, RxParseRole, RxParseQuery, RxParseInstallation } from 'RxParse';
init.init();

describe('RxAVInstallation', function () {
    before(() => {

    });
    it('RxAVInstallation#userActivate', done => {
        let installation = new RxParseInstallation();
        installation.deviceType = 'ios';
        installation.deviceToken = random.newToken();
        installation.channels = ['public', 'fuck'];
        installation.save().flatMap(insSaved => {
            return RxParseUser.logIn('junwu', 'leancloud');
        }).flatMap(loggedIn => {
            console.log('loggedIn');
            return loggedIn.activate(installation, true);
        }).subscribe(bound => {
            done();
        }, error => {
            console.log(error);
        });
    });
});