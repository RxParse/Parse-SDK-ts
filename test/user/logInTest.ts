import * as chai from 'chai';
import * as init from "../utils/init";
import { RxParseUser } from '../../src/RxParse';
import { Observable } from 'rxjs';
import { flatMap } from 'rxjs/operators';

describe('RxAVUser', function () {
    before(() => {
    });
    it('RxAVUser#currentSession', function (done) {
        RxParseUser.logIn('junwu', 'leancloud').pipe(flatMap(user => {
            console.log(RxParseUser.usersMap);
            return RxParseUser.currentSessionToken();
        })).subscribe(sessionToken => {
            console.log('sessionToken', sessionToken);
            done();
        });
    });
    it('RxAVUser#logIn', function (done) {
        RxParseUser.logIn('junwu', 'leancloud').subscribe(user => {
            console.log(user.username);
            console.log(user.sessionToken);
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
        RxParseUser.logIn('junwu', 'leancloud').pipe(flatMap(user => {
            console.log(user.username);
            console.log(user.state);
            chai.assert.isNotNull(user.username);
            return user.isAuthenticated().pipe(flatMap(s => {
                user.set('title', 'xman');
                return user.save();
            }));
        })).subscribe(s1 => {
            done();
        });
    });
});
