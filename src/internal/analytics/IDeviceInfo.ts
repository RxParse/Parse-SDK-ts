import { RxAVAnalyticDevice } from '../../public/RxAVAnalytics';

export interface IDeviceInfo {
    getDevice(): Promise<RxAVAnalyticDevice>;
}