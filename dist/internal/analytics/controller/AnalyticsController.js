"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const RxAVAnalytics_1 = require("../../../public/RxAVAnalytics");
const RxAVClient_1 = require("../../../public/RxAVClient");
const AVCommand_1 = require("../../command/AVCommand");
class AnalyticsController {
    constructor(commandRunner, deviceInfo) {
        this._commandRunner = commandRunner;
        this.deviceProvider = deviceInfo;
    }
    send(analyticsData, sessionToken) {
        let collectCMD = new AVCommand_1.AVCommand({
            relativeUrl: '/stats/collect',
            method: 'POST',
            data: analyticsData.encodeForSendServer()
        });
        return this._commandRunner.runRxCommand(collectCMD).map(res => {
            return res.satusCode == 200;
        });
    }
    getPolicy() {
        var policyCMD = new AVCommand_1.AVCommand({
            relativeUrl: `/statistics/apps/${RxAVClient_1.RxAVClient.instance.currentApp.appId}/sendPolicy`,
            method: 'GET',
        });
        return this._commandRunner.runRxCommand(policyCMD).map(res => {
            let rtn = new RxAVAnalytics_1.RxAVAnalytics();
            rtn.enable = res.body.enable;
            rtn.policy = res.body.policy;
            rtn.parameters = res.body.parameters;
            return rtn;
        });
    }
}
exports.AnalyticsController = AnalyticsController;
