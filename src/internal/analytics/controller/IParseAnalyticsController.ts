import { Observable } from 'rxjs';
import { IDeviceInfo } from '../IDeviceInfo';
import { ParseApp, RxParseAnalytics } from 'RxParse';

export interface IParseAnalyticsController {
    deviceProvider: IDeviceInfo;
    send(analyticsData: RxParseAnalytics, sessionToken: string): Observable<boolean>;
    getPolicy(app?: ParseApp): Observable<RxParseAnalytics>;
}