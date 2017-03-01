import * as chai from 'chai';
import * as random from "../utils/random";
import { RxAVClient, RxAVAnalytics, IDeviceInfo, RxAVAnalyticDevice } from '../../src/RxLeanCloud';
const os = require('os');

export class PCInfo implements IDeviceInfo {
    getDevice(): Promise<RxAVAnalyticDevice> {
        let device = new RxAVAnalyticDevice();
        device.app_version = '0.0.2';
        device.channel = 'LeanCloud Store';
        device.device_model = 'iPhone 6s plus';
        device.os = 'iOS';
        device.device_id = '665188eb-1a7e-4fd5-928e-cd334b0be54e';
        device.os_version = '10.11.0';
        device.sdk_version = RxAVClient.sdk_version;
        return Promise.resolve<RxAVAnalyticDevice>(device);
    }
}

describe('RxAVAnalytics', function () {
    before(() => {
        RxAVClient.init({
            appId: 'uay57kigwe0b6f5n0e1d4z4xhydsml3dor24bzwvzr57wdap',
            appKey: 'kfgz7jjfsk55r5a8a3y4ttd3je1ko11bkibcikonk32oozww',
            region: 'cn',
            log: true,
            plugins: {
                device: new PCInfo()
            }
        });
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