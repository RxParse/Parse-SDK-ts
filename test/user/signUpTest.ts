import * as chai from 'chai';
import * as random from "../utils/random";
import { RxAVClient } from '../../src/RxLeanCloud';
import { RxAVUser, RxAVACL, RxAVRole } from '../../src/RxLeanCloud';

let randomUsername = '';

describe('RxAVUser', function () {
    before(() => {
        RxAVClient.init({
            appId: 'uay57kigwe0b6f5n0e1d4z4xhydsml3dor24bzwvzr57wdap',
            appKey: 'kfgz7jjfsk55r5a8a3y4ttd3je1ko11bkibcikonk32oozww',
            region: 'cn',
            log: true,
            pluginVersion: 2
        });
        randomUsername = random.randomString(8);
    });
    it('RxAVUser#signUp', function (done) {
        let user: RxAVUser = new RxAVUser();
        user.username = randomUsername;
        user.password = 'leancloud';
        user.set('title', 'CEO');

        user.signUp().subscribe(() => {
            done();
        }, error => {
            /** error 的格式如下：
             * {statusCode: -1,error: { code: 0, error: 'Server error' }}
             * statusCode:是本次 http 请求的应答的响应码，LeanCloud 云端会返回标准的 Http Status，一般错误可以从这里查找原因
             * 而具体的逻辑错误可以从 error: { code: 0, error: 'Server error' } 这里来查找，这部分错误在 LeanCloud 官方文档的错误码对照表有详细介绍
             */
            chai.assert.isNull(error);
            if (error.error.code == 1) {
                console.log('1.这个错误是因为 http 请求的 url 拼写有误，一般情况下可能是 class name 不符合规范，请确认');
                console.log('2.还有可能是您错误的使用跨节点的 AppId 调用 API，例如您可能正在使用北美节点上的 AppId 访问大陆的节点，这一点请仔细阅读官方文档');
            }
        });
    });

    it('RxAVUser#requestShortcode', done => {
        if (RxAVClient.currentConfig().region.toLowerCase() == 'us' || 'cn') {
            done();
            return;
        }

        RxAVUser.sendSignUpShortcode('18612438929').subscribe(success => {
            done();
        }, error => {
            console.log(error);
            //statusCode: 400, error: { code: 127, error: '无效的手机号码。' }
            //{ statusCode: 400, error: { code: 601, error: '发送短信过快，请稍后重试。' } }
            chai.assert.isNull(error);
        });
    });

    it('RxAVUser#signUpOrLoginByMobilephone', done => {
        if (RxAVClient.currentConfig().region.toLowerCase() == 'us' || 'cn') {
            done();
            return;
        }
        let user = new RxAVUser();
        user.username = random.randomString(8);
        user.password = 'leancloud';
        user.set('nickName', 'hahaha');
        RxAVUser.signUpByMobilephone('18612438929', '064241', user).subscribe(s => {
            done();
        }, error => {
            console.log(error);
            //statusCode: 400, error: { code: 127, error: '无效的手机号码。' }
            chai.assert.isNull(error);
        });
    });
    // it('RxAVUser#signUpWithPrimaryRole', done => {
    //     let user: RxAVUser = new RxAVUser();
    //     user.username = random.randomString(8);
    //     user.password = 'leancloud';
    //     user.signUp().flatMap<boolean>(s => {
    //         let randomRoleName1 = random.randomHexString(8);
    //         let randomRole1 = new RxAVRole(randomRoleName1, new RxAVACL(user));
    //         return user.setPrimaryRole(randomRole1);
    //     }).flatMap<Array<RxAVRole>>(s3 => {
    //         return user.fetchRoles();
    //     }).subscribe(roles => {
    //         chai.assert.isTrue(roles.length == 1);
    //         done();
    //     });
    // });
    it('RxAVUser#create', done => {
        let user: RxAVUser = new RxAVUser();
        user.username = random.randomString(8);
        user.password = 'leancloud';
        user.create().subscribe(s => {
            chai.assert.isNotNull(user.objectId);
            done();
        });
    });
});
