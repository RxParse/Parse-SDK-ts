/// <reference path="../../typings/index.d.ts" />
"use strict";
var chai = require('chai');
var RxLeanCloud_1 = require('../../src/RxLeanCloud');
describe('RxAVUser', function () {
    before(function () {
    });
    it('RxAVUser#logIn', function (done) {
        RxLeanCloud_1.RxAVUser.login('junwu', 'leancloud').subscribe(function (user) {
            console.log(user.username);
            console.log(user.state);
            chai.assert.isNotNull(user.username);
            user.isAuthenticated().subscribe(function (s) {
                console.log('user.isAuthenticated()', s);
                chai.assert.isTrue(s);
                done();
            });
        }, function (error) {
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
});
