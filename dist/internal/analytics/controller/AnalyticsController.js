"use strict";
var RxLeancloud_1 = require('../../../RxLeancloud');
var AVCommand_1 = require('../../command/AVCommand');
var AnalyticsController = (function () {
    function AnalyticsController(commandRunner, deviceInfo) {
        this._commandRunner = commandRunner;
    }
    AnalyticsController.prototype.send = function (analyticsData, sessionToken) {
        var collectCMD = new AVCommand_1.AVCommand({
            relativeUrl: '/stats/collect',
            method: 'POST',
            data: analyticsData.encodeForSendServer()
        });
        return this._commandRunner.runRxCommand(collectCMD).map(function (res) {
            return res.satusCode == 200;
        });
    };
    AnalyticsController.prototype.getPolicy = function () {
        var policyCMD = new AVCommand_1.AVCommand({
            relativeUrl: "/statistics/apps/" + RxLeancloud_1.RxAVClient.currentConfig().applicationId + "/sendPolicy",
            method: 'GET',
        });
        return this._commandRunner.runRxCommand(policyCMD).map(function (res) {
            var rtn = new RxLeancloud_1.RxAVAnalytics();
            rtn.enable = res.body.enable;
            rtn.policy = res.body.policy;
            rtn.parameters = res.body.parameters;
            return rtn;
        });
    };
    return AnalyticsController;
}());
exports.AnalyticsController = AnalyticsController;
