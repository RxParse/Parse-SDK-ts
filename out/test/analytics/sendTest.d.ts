import { IDeviceInfo, RxAVAnalyticDevice } from '../../src/RxLeanCloud';
export declare class PCInfo implements IDeviceInfo {
    getDevice(): Promise<RxAVAnalyticDevice>;
}
