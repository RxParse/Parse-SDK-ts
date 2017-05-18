import { Observable } from 'rxjs';
import { IDeviceInfo } from '../IDeviceInfo';
import { RxAVAnalytics } from '../../../public/RxAVAnalytics';
import { RxAVClient, RxAVApp } from '../../../public/RxAVClient';
import { IAnalyticsController } from './IAnalyticsController';
import { SDKPlugins } from '../../SDKPlugins';
import { AVCommand } from '../../command/AVCommand';
import { IAVCommandRunner } from '../../command/IAVCommandRunner';

export class AnalyticsController implements IAnalyticsController {
    private readonly _commandRunner: IAVCommandRunner;
    deviceProvider: IDeviceInfo;
    constructor(commandRunner: IAVCommandRunner, deviceInfo: IDeviceInfo) {
        this._commandRunner = commandRunner;
        this.deviceProvider = deviceInfo;
    }
    send(analyticsData: RxAVAnalytics, sessionToken: string): Observable<boolean> {
        let collectCMD = new AVCommand({
            app: analyticsData.app,
            relativeUrl: '/stats/collect',
            method: 'POST',
            data: analyticsData.encodeForSendServer()
        });
        return this._commandRunner.runRxCommand(collectCMD).map(res => {
            return res.satusCode == 200;
        });
    }
    getPolicy(app?: RxAVApp): Observable<RxAVAnalytics> {
        var policyCMD = new AVCommand({
            app: app,
            relativeUrl: `/statistics/apps/${RxAVClient.instance.currentApp.appId}/sendPolicy`,
            method: 'GET',
        });
        return this._commandRunner.runRxCommand(policyCMD).map(res => {
            let rtn = new RxAVAnalytics(null, { app: app });
            rtn.enable = res.body.enable;
            rtn.policy = res.body.policy;
            rtn.parameters = res.body.parameters;
            return rtn;
        });
    }
}