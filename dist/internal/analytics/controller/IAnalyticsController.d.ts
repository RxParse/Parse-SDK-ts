import { Observable } from 'rxjs';
import { IDeviceInfo } from '../IDeviceInfo';
import { RxAVAnalytics } from '../../../RxLeancloud';
export interface IAnalyticsController {
    deviceProvider: IDeviceInfo;
    send(analyticsData: RxAVAnalytics, sessionToken: string): Observable<boolean>;
    getPolicy(): Observable<RxAVAnalytics>;
}
