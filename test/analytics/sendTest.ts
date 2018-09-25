import * as chai from 'chai';
import * as random from "../utils/random";
import { ParseClient, RxParseAnalytics, IDeviceInfo, RxParseAnalyticDevice } from '../../src/RxParse';
import * as init from "../utils/init";
const os = require('os');

init.init();

describe('RxAVAnalytics', function () {
    before(() => {

    });
    it('RxAVAnalytics#send', done => {
        RxParseAnalytics.init().flatMap(enable => {
            if (enable) {
                var analytics = RxParseAnalytics.currentAnalytics;
                analytics.trackAppOpenedWithPush({
                    alert: 'Hello,LeanCloud!',
                    data: {
                        k1: 'v1',
                        k2: 6666
                    }
                });
                let pageId = analytics.beginPage('xPage');
                analytics.trackEvent('xClicked');
                let inputEventId = analytics.beginEvent('xPut', 'username', {
                    max: 777
                });
                analytics.endEvent(inputEventId, {
                    min: 111
                });
                analytics.endPage(pageId);
                analytics.closeSession();
                return analytics.send();
            }
        }).subscribe(sent => {
            done();
        });
    });

});