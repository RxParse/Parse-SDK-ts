"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var RxLeanCloud_1 = require("../../src/RxLeanCloud");
var os = require('os');
var PCInfo = (function () {
    function PCInfo() {
    }
    PCInfo.prototype.getDevice = function () {
        var device = new RxLeanCloud_1.RxAVAnalyticDevice();
        device.app_version = '0.0.1';
        device.channel = 'LeanCloud Store';
        device.device_model = process.platform;
        device.os = os.platform();
        device.os_version = '10.12.3';
        device.sdk_version = RxLeanCloud_1.RxAVClient.sdk_version;
        return Promise.resolve(device);
    };
    return PCInfo;
}());
exports.PCInfo = PCInfo;
describe('RxAVAnalytics', function () {
    before(function () {
        RxLeanCloud_1.RxAVClient.init({
            appId: 'uay57kigwe0b6f5n0e1d4z4xhydsml3dor24bzwvzr57wdap',
            appKey: 'kfgz7jjfsk55r5a8a3y4ttd3je1ko11bkibcikonk32oozww',
            region: 'cn',
            log: true,
            plugins: {
                device: new PCInfo()
            }
        });
    });
    it('RxAVAnalytics#send', function (done) {
        RxLeanCloud_1.RxAVAnalytics.init().flatMap(function (enable) {
            if (enable) {
                var analytics = RxLeanCloud_1.RxAVAnalytics.currentAnalytics;
                analytics.trackAppOpened();
                var pageId = analytics.beginPage('LogInPage');
                analytics.trackEvent('LogIn_Button_Clicked');
                var inputEventId = analytics.beginEevent('Input', 'username', {
                    max: 666
                });
                analytics.endEvent(inputEventId, {
                    min: 222
                });
                analytics.endPage(pageId);
                return analytics.send();
            }
        }).subscribe(function (sent) {
            done();
        });
    });
});
