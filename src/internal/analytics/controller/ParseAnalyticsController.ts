import { Observable } from 'rxjs';
import { IDeviceInfo } from '../IDeviceInfo';
import { RxParseAnalytics } from '../../../public/RxParseAnalytics';
import { ParseClient, ParseApp } from '../../../public/RxParseClient';
import { IParseAnalyticsController } from './IParseAnalyticsController';
import { SDKPlugins } from '../../SDKPlugins';
import { ParseCommand } from '../../command/ParseCommand';
import { IParseCommandRunner } from '../../command/IParseCommandRunner';

export class ParseAnalyticsController implements IParseAnalyticsController {
    private readonly _commandRunner: IParseCommandRunner;
    deviceProvider: IDeviceInfo;
    constructor(commandRunner: IParseCommandRunner, deviceInfo: IDeviceInfo) {
        this._commandRunner = commandRunner;
        this.deviceProvider = deviceInfo;
    }
    send(analyticsData: RxParseAnalytics, sessionToken: string): Observable<boolean> {
        let collectCMD = new ParseCommand({
            app: analyticsData.app,
            relativeUrl: '/stats/collect',
            method: 'POST',
            data: analyticsData.encodeForSendServer()
        });
        return this._commandRunner.runRxCommand(collectCMD).map(res => {
            return res.statusCode == 200;
        });
    }
    getPolicy(app?: ParseApp): Observable<RxParseAnalytics> {
        var policyCMD = new ParseCommand({
            app: app,
            relativeUrl: `/statistics/apps/${ParseClient.instance.currentApp.appId}/sendPolicy`,
            method: 'GET',
        });
        return this._commandRunner.runRxCommand(policyCMD).map(res => {
            let rtn = new RxParseAnalytics(null, { app: app });
            rtn.enable = res.body.enable;
            rtn.policy = res.body.policy;
            rtn.parameters = res.body.parameters;
            return rtn;
        });
    }
}