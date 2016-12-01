"use strict";
var Observable_1 = require('rxjs/Observable');
require('rxjs/Rx');
var axios_1 = require('axios');
require('axios');
var RxHttpClient = (function () {
    function RxHttpClient(version) {
        this.version = version;
        if (this.version == 0)
            this.version = 1;
    }
    RxHttpClient.prototype.execute = function (httpRequest) {
        return Observable_1.Observable.fromPromise(this.RxExecuteAxios(httpRequest)).map(function (res) {
            console.log('Observable.fromPromise');
            var rtn = [200, ''];
            rtn[0] = res.status;
            rtn[1] = res.data;
            return rtn;
        });
        //return this.RxExecuteSuperAgent(httpRequest);
    };
    RxHttpClient.prototype.RxExecuteAxios = function (httpRequest) {
        console.log('RxExecuteAxios');
        var method = httpRequest.method.toUpperCase();
        var useData = false;
        if (method == 'PUT' || 'POST') {
            useData = true;
        }
        return axios_1.default({
            method: method,
            url: httpRequest.url,
            data: useData ? httpRequest.data : null,
            headers: httpRequest.headers
        });
    };
    return RxHttpClient;
}());
exports.RxHttpClient = RxHttpClient;
