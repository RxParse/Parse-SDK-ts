"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const AVCommand_1 = require("../../command/AVCommand");
const SDKPlugins_1 = require("../../SDKPlugins");
const rxjs_1 = require("rxjs");
class QueryController {
    constructor(commandRunner) {
        this._commandRunner = commandRunner;
    }
    find(query, sessionToken) {
        let qu = this.buildQueryString(query);
        let cmd = new AVCommand_1.AVCommand({
            app: query.app,
            relativeUrl: qu,
            method: 'GET',
            sessionToken: sessionToken
        });
        return this._commandRunner.runRxCommand(cmd).map(res => {
            let items = res.body["results"];
            let x = items.map((item, i, a) => {
                let y = SDKPlugins_1.SDKPlugins.instance.ObjectDecoder.decode(item, SDKPlugins_1.SDKPlugins.instance.Decoder);
                return y;
            });
            return x;
        });
    }
    count(query, sesstionToken) {
        return rxjs_1.Observable.from([0]);
    }
    fitst(query, sesstionToken) {
        return null;
    }
    buildQueryString(query) {
        let queryJson = query.buildParameters();
        let queryArray = [];
        let queryUrl = '';
        for (let key in queryJson) {
            let qs = `${key}=${queryJson[key]}`;
            queryArray.push(qs);
        }
        queryUrl = queryArray.join('&');
        return `/classes/${query.className}?${queryUrl}`;
    }
}
exports.QueryController = QueryController;
