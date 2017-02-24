import { Observable } from 'rxjs';
import { IDeviceInfo } from '../IDeviceInfo';
import { RxAVAnalytics, RxAVClient } from '../../../RxLeancloud';
import { IAnalyticsController } from './IAnalyticsController';
import { SDKPlugins } from '../../SDKPlugins';
import { AVCommand } from '../../command/AVCommand';
import { IAVCommandRunner } from '../../command/IAVCommandRunner';

export class AnalyticsController implements IAnalyticsController {
    private readonly _commandRunner: IAVCommandRunner;
    deviceProvider: IDeviceInfo;
    constructor(commandRunner: IAVCommandRunner,deviceInfo:IDeviceInfo) {
        this._commandRunner = commandRunner;
    }
    send(analyticsData: RxAVAnalytics, sessionToken: string): Observable<boolean> {
        let collectCMD = new AVCommand({
            relativeUrl: '/stats/collect',
            method: 'POST',
            data: analyticsData.encodeForSendServer()
        });
        return this._commandRunner.runRxCommand(collectCMD).map(res => {
            return res.satusCode == 200;
        });
    }
    getPolicy(): Observable<RxAVAnalytics> {
        var policyCMD = new AVCommand({
            relativeUrl: `/statistics/apps/${RxAVClient.currentConfig().applicationId}/sendPolicy`,
            method: 'GET',
        });
        return this._commandRunner.runRxCommand(policyCMD).map(res => {
            let rtn = new RxAVAnalytics();
            rtn.enable = res.body.enable;
            rtn.policy = res.body.policy;
            rtn.parameters = res.body.parameters;
            return rtn;
        });
    }
}