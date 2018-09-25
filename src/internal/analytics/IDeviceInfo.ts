import { RxParseAnalyticDevice } from 'public/RxParseAnalytics';

export interface IDeviceInfo {
    getDevice(): Promise<RxParseAnalyticDevice>;
}