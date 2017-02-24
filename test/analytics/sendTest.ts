import * as chai from 'chai';
import * as random from "../utils/random";
import { RxAVClient, RxAVAnalytics, IDeviceInfo, RxAVAnalyticDevice } from '../../src/RxLeanCloud';
const os = require('os');

export class PCInfo implements IDeviceInfo {
    getDevice(): Promise<RxAVAnalyticDevice> {
        let device = new RxAVAnalyticDevice();
        device.app_version = '0.0.1';
        device.channel = 'LeanCloud Store';
        device.device_model = process.platform;
        device.os = os.platform();
        device.os_version = '10.12.3';
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
                analytics.trackAppOpened();
                let pageId = analytics.beginPage('LogInPage');
                analytics.trackEvent('LogIn_Button_Clicked');
                let inputEventId = analytics.beginEevent('Input', 'username', {
                    max: 666
                });
                analytics.endEvent(inputEventId, {
                    min: 222
                });
                analytics.endPage(pageId);
                return analytics.send();
            }
        }).subscribe(sent => {
            done();
        });
    });

});