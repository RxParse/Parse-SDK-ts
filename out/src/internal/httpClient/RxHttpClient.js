"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var rxjs_1 = require("rxjs");
var HttpResponse_1 = require("./HttpResponse");
var axios_1 = require("axios");
var superagent = require("superagent");
var RxAVClient_1 = require("../../public/RxAVClient");
var RxHttpClient = (function () {
    function RxHttpClient(version) {
        this.version = version;
    }
    RxHttpClient.prototype.execute = function (httpRequest) {
        var tuple = [200, ''];
        var errMsg = {
            statusCode: -1,
            error: { code: 0, error: 'Server error' }
        };
        var response = new HttpResponse_1.HttpResponse(tuple);
        RxAVClient_1.RxAVClient.printLog('Request:', JSON.stringify(httpRequest));
        if (RxAVClient_1.RxAVClient.isNode() && this.version == 1) {
            RxAVClient_1.RxAVClient.printLog('http client:axios');
            return rxjs_1.Observable.fromPromise(this.RxExecuteAxios(httpRequest)).map(function (res) {
                tuple[0] = res.status;
                tuple[1] = res.data;
                var response = new HttpResponse_1.HttpResponse(tuple);
                RxAVClient_1.RxAVClient.printLog('Response:', JSON.stringify(response));
                return response;
            }).catch(function (err) {
                RxAVClient_1.RxAVClient.printLog('Meta Error:', err);
                if (err) {
                    errMsg.statusCode = err.response.status;
                    errMsg.error = err.response.data;
                }
                RxAVClient_1.RxAVClient.printLog('Error:', JSON.stringify(errMsg));
                return rxjs_1.Observable.throw(errMsg);
            });
        }
        else {
            RxAVClient_1.RxAVClient.printLog('http client:superagent');
            return rxjs_1.Observable.fromPromise(this.RxExecuteSuperagent(httpRequest)).map(function (res) {
                tuple[0] = res.status;
                tuple[1] = res.body;
                var response = new HttpResponse_1.HttpResponse(tuple);
                RxAVClient_1.RxAVClient.printLog('Response:', JSON.stringify(response));
                return response;
            }).catch(function (err) {
                RxAVClient_1.RxAVClient.printLog('Meta Error:', err);
                if (err) {
                    errMsg.statusCode = err.status;
                    errMsg.error = JSON.parse(err.response.text);
                }
                RxAVClient_1.RxAVClient.printLog('Error:', errMsg);
                return rxjs_1.Observable.throw(errMsg);
            });
        }
    };
    RxHttpClient.prototype.batchExecute = function () {
    };
    RxHttpClient.prototype.RxExecuteAxios = function (httpRequest) {
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
    RxHttpClient.prototype.RxExecuteSuperagent = function (httpRequest) {
        var method = httpRequest.method.toUpperCase();
        if (method == 'POST')
            return new Promise(function (resolve, reject) {
                superagent
                    .post(httpRequest.url)
                    .send(httpRequest.data)
                    .set(httpRequest.headers)
                    .end(function (error, res) {
                    error ? reject(error) : resolve(res);
                });
            });
        else if (method == 'PUT')
            return new Promise(function (resolve, reject) {
                superagent
                    .put(httpRequest.url)
                    .send(httpRequest.data)
                    .set(httpRequest.headers)
                    .end(function (error, res) {
                    error ? reject(error) : resolve(res);
                });
            });
        else if (method == 'GET')
            return new Promise(function (resolve, reject) {
                superagent
                    .get(httpRequest.url)
                    .set(httpRequest.headers)
                    .end(function (error, res) {
                    error ? reject(error) : resolve(res);
                });
            });
        else if (method == 'DELETE')
            return new Promise(function (resolve, reject) {
                superagent
                    .del(httpRequest.url)
                    .set(httpRequest.headers)
                    .end(function (error, res) {
                    error ? reject(error) : resolve(res);
                });
            });
    };
    return RxHttpClient;
}());
exports.RxHttpClient = RxHttpClient;
