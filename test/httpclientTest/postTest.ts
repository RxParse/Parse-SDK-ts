/// <reference path="../../typings/index.d.ts" />
import * as request from 'superagent';
import axios from 'axios';
import { Observable, Observer } from 'rxjs';
import * as chai from 'chai';

describe('RxObject', function () {
    before(() => {
    });
    it('RxAVObject#save', function (done) {
        request.post('https://api.leancloud.cn/1.1/classes/RxTodo')
            .send({ title: '开会', time: '2016-12-03' })
            .set('Accept', 'application/json')
            .set('X-LC-Id', 'uay57kigwe0b6f5n0e1d4z4xhydsml3dor24bzwvzr57wdap')
            .set('X-LC-Key', 'kfgz7jjfsk55r5a8a3y4ttd3je1ko11bkibcikonk32oozww')
            .set('Content-Type', 'application/json')
            .end((error, res) => {
                //console.log('end', error, res);
                done();
            });

    });
});