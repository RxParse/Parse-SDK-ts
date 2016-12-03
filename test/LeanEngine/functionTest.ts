/// <reference path="../../typings/index.d.ts" />

import * as chai from 'chai';
import * as random from "../utils/random";
import { RxAVClient, RxLeanEngine } from '../../src/RxLeanCloud';

let randomUsername = '';

describe('RxLeanEngine', function () {
    before(() => {
        RxAVClient.init({
            appId: 'uay57kigwe0b6f5n0e1d4z4xhydsml3dor24bzwvzr57wdap',
            appKey: 'kfgz7jjfsk55r5a8a3y4ttd3je1ko11bkibcikonk32oozww',
            log: true,
            pluginVersion: 1
        });
        randomUsername = random.randomString(8);
    });
    it('RxLeanEngine#signUp', function (done) {

        RxLeanEngine.callFunction('testDic').subscribe(data => {
            console.log(data);
            done();
        }, error => {
            /** error 的格式如下：
             * {statusCode: -1,error: { code: 0, error: 'Server error' }}
             * statusCode:是本次 http 请求的应答的响应码，LeanCloud 云端会返回标准的 Http Status，一般错误可以从这里查找原因
             * 而具体的逻辑错误可以从 error: { code: 0, error: 'Server error' } 这里来查找，这部分错误在 LeanCloud 官方文档的错误码对照表有详细介绍
             */
            console.log(error);
            if (error.error.code == 1) {
                console.log('1.这个错误可能是云函数名称拼写错误，或者您在生产环境中并没有部署云引擎实例');
                console.log('2.还有可能是您错误的使用跨节点的 AppId 调用 API，例如您可能正在使用北美节点上的 AppId 访问大陆的节点，这一点请仔细阅读官方文档');
            }
        });
    });
});
