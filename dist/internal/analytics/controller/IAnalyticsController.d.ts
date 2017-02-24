import { Observable } from 'rxjs';
import { IDeviceInfo } from '../IDeviceInfo';
import { RxAVAnalytics } from '../../../public/RxAVAnalytics';
export interface IAnalyticsController {
    deviceProvider: IDeviceInfo;
    send(analyticsData: RxAVAnalytics, sessionToken: string): Observable<boolean>;
    getPolicy(): Observable<RxAVAnalytics>;
}
