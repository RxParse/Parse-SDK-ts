import { Observable } from 'rxjs';
import { IDeviceInfo } from '../IDeviceInfo';
import { RxAVAnalytics } from '../../../public/RxAVAnalytics';
import { IAnalyticsController } from './IAnalyticsController';
import { IAVCommandRunner } from '../../command/IAVCommandRunner';
export declare class AnalyticsController implements IAnalyticsController {
    private readonly _commandRunner;
    deviceProvider: IDeviceInfo;
    constructor(commandRunner: IAVCommandRunner, deviceInfo: IDeviceInfo);
    send(analyticsData: RxAVAnalytics, sessionToken: string): Observable<boolean>;
    getPolicy(): Observable<RxAVAnalytics>;
}
