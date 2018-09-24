import { RxParseClient, RxAVAnalytics, IDeviceInfo, RxAVAnalyticDevice } from 'RxParse';

export class PCInfo implements IDeviceInfo {
    getDevice(): Promise<RxAVAnalyticDevice> {
        let device = new RxAVAnalyticDevice();
        device.app_version = '0.0.2';
        device.channel = 'LeanCloud Store';
        device.device_model = 'iPhone 6s plus';
        device.os = 'iOS';
        device.device_id = '665188eb-1a7e-4fd5-928e-cd334b0be54e';
        device.os_version = '10.11.0';
        device.sdk_version = RxParseClient.instance.SDKVersion;
        return Promise.resolve<RxAVAnalyticDevice>(device);
    }
}