import * as chai from 'chai';
import * as random from "../utils/random";
import { RxAVClient, RxAVAnalytics, IDeviceInfo, RxAVAnalyticDevice } from '../../src/RxLeanCloud';
import * as init from "../utils/init";
const os = require('os');

describe('RxAVAnalytics', function () {
    before(() => {

    });
    it('RxAVAnalytics#send', done => {
        RxAVAnalytics.init().flatMap(enable => {
            if (enable) {
                var analytics = RxAVAnalytics.currentAnalytics;
                analytics.trackAppOpenedWithPush({
                    alert: 'Hello,LeanCloud!',
                    data: {
                        k1: 'v1',
                        k2: 6666
                    }
                });
                let pageId = analytics.beginPage('xPage');
                analytics.trackEvent('xClicked');
                let inputEventId = analytics.beginEevent('xPut', 'username', {
                    max: 777
                });
                analytics.endEvent(inputEventId, {
                    min: 111
                });
                analytics.endPage(pageId);
                analytics.closeSesstion();
                return analytics.send();
            }
        }).subscribe(sent => {
            done();
        });
    });

});