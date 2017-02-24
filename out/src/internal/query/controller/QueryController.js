"use strict";
var AVCommand_1 = require('../../command/AVCommand');
var SDKPlugins_1 = require('../../SDKPlugins');
var rxjs_1 = require('rxjs');
var QueryController = (function () {
    function QueryController(commandRunner) {
        this._commandRunner = commandRunner;
    }
    QueryController.prototype.find = function (query, sessionToken) {
        var qu = this.buildQueryString(query);
        var cmd = new AVCommand_1.AVCommand({
            relativeUrl: qu,
            method: 'GET',
            sessionToken: sessionToken
        });
        return this._commandRunner.runRxCommand(cmd).map(function (res) {
            var items = res.body["results"];
            var x = items.map(function (item, i, a) {
                var y = SDKPlugins_1.SDKPlugins.instance.ObjectDecoder.decode(item, SDKPlugins_1.SDKPlugins.instance.Decoder);
                return y;
            });
            return x;
        });
    };
    QueryController.prototype.count = function (query, sesstionToken) {
        return rxjs_1.Observable.from([0]);
    };
    QueryController.prototype.fitst = function (query, sesstionToken) {
        return null;
    };
    QueryController.prototype.buildQueryString = function (query) {
        var queryJson = query.buildParameters();
        var queryArray = [];
        var queryUrl = '';
        for (var key in queryJson) {
            var qs = key + "=" + queryJson[key];
            queryArray.push(qs);
        }
        queryUrl = queryArray.join('&');
        return "/classes/" + query.className + "?" + queryUrl;
    };
    return QueryController;
}());
exports.QueryController = QueryController;
