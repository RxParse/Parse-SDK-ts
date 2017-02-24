import * as chai from 'chai';

import { RxAVUser, RxAVClient } from '../../src/RxLeanCloud';

describe('RxAVUser', function () {
    before(() => {
        RxAVClient.init({
            appId: 'uay57kigwe0b6f5n0e1d4z4xhydsml3dor24bzwvzr57wdap',
            appKey: 'kfgz7jjfsk55r5a8a3y4ttd3je1ko11bkibcikonk32oozww',
            region: 'cn',
            log: true,
            pluginVersion: 2
        });
    });
    it('RxAVUser#logIn', function (done) {
        RxAVUser.logIn('junwu', 'leancloud').subscribe(user => {
            console.log(user.username);
            console.log(user.state);
            chai.assert.isNotNull(user.username);
            user.isAuthenticated().subscribe(s => {
                console.log('user.isAuthenticated()', s);
                chai.assert.isTrue(s);
                done();
            });
        }, error => {
            /** error 的格式如下：
             * {statusCode: -1,error: { code: 0, error: 'Server error' }}
             * statusCode:是本次 http 请求的应答的响应码，LeanCloud 云端会返回标准的 Http Status，一般错误可以从这里查找原因
             * 而具体的逻辑错误可以从 error: { code: 0, error: 'Server error' } 这里来查找，这部分错误在 LeanCloud 官方文档的错误码对照表有详细介绍
             */
            chai.assert.isNull(error);
            if (error.error.code == 211) {
                console.log('这个错误表示用户名不存在');
            }
            if (error.error.code == 210) {
                console.log('这个错误表示密码错误');
            }
        });
    });

    it('RxAVUser#logIn->currentUser', function (done) {
        RxAVUser.logIn('junwu', 'leancloud').flatMap(user => {
            console.log(user.username);
            console.log(user.state);
            chai.assert.isNotNull(user.username);
            return user.isAuthenticated().flatMap(s => {
                user.set('title', 'xman');
                return user.save();
            });
        }).subscribe(s1 => {
            done();
        });
    });

    it('RxAVUser#logInWithMobilephone', done => {
        RxAVUser.logInWithMobilephone('18612438929', 'leancloud').subscribe(user => {
            chai.assert.isNotNull(user);
            done();
        }, error => {
            chai.assert.isNull(error);
            done();
        });
    });
});
