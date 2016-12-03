/// <reference path="../../typings/index.d.ts" />
"use strict";
var chai = require('chai');
var random = require("../utils/random");
var RxLeanCloud_1 = require('../../src/RxLeanCloud');
var randomUsername = '';
describe('RxAVUser', function () {
    before(function () {
        randomUsername = random.randomString(8);
    });
    it('RxAVUser#signUp', function (done) {
        var user = new RxLeanCloud_1.RxAVUser();
        user.username = randomUsername;
        user.password = 'leancloud';
        user.set('title', 'CEO');
        user.signUp().subscribe(function () {
            done();
        }, function (error) {
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
});
