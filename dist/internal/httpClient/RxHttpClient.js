"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const rxjs_1 = require("rxjs");
const HttpResponse_1 = require("./HttpResponse");
const axios_1 = require("axios");
const superagent = require("superagent");
const RxAVClient_1 = require("../../public/RxAVClient");
class RxHttpClient {
    constructor(version) {
        this.version = version;
    }
    execute(httpRequest) {
        let tuple = [200, ''];
        let errMsg = {
            statusCode: -1,
            error: { code: 0, error: 'Server error' }
        };
        let response = new HttpResponse_1.HttpResponse(tuple);
        RxAVClient_1.RxAVClient.printLog('Request:', JSON.stringify(httpRequest));
        if (RxAVClient_1.RxAVClient.instance.currentConfiguration.isNode && this.version == 1) {
            RxAVClient_1.RxAVClient.printLog('http client:axios');
            return rxjs_1.Observable.fromPromise(this.RxExecuteAxios(httpRequest)).map(res => {
                tuple[0] = res.status;
                tuple[1] = res.data;
                let response = new HttpResponse_1.HttpResponse(tuple);
                RxAVClient_1.RxAVClient.printLog('Response:', JSON.stringify(response));
                return response;
            }).catch((err) => {
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
            return rxjs_1.Observable.fromPromise(this.RxExecuteSuperagent(httpRequest)).map(res => {
                tuple[0] = res.status;
                tuple[1] = res.body;
                let response = new HttpResponse_1.HttpResponse(tuple);
                RxAVClient_1.RxAVClient.printLog('Response:', JSON.stringify(response));
                return response;
            }).catch((err) => {
                RxAVClient_1.RxAVClient.printLog('Meta Error:', err);
                if (err) {
                    errMsg.statusCode = err.status;
                    errMsg.error = JSON.parse(err.response.text);
                }
                RxAVClient_1.RxAVClient.printLog('Error:', errMsg);
                return rxjs_1.Observable.throw(errMsg);
            });
        }
    }
    batchExecute() {
    }
    RxExecuteAxios(httpRequest) {
        let method = httpRequest.method.toUpperCase();
        let useData = false;
        if (method == 'PUT' || 'POST') {
            useData = true;
        }
        return new Promise((resovle, reject) => {
            axios_1.default({
                method: method,
                url: httpRequest.url,
                data: useData ? httpRequest.data : null,
                headers: httpRequest.headers
            }).then(response => {
                resovle(response);
            }).catch(error => {
                reject(error);
            });
        });
    }
    RxExecuteSuperagent(httpRequest) {
        let method = httpRequest.method.toUpperCase();
        if (method == 'POST')
            return new Promise((resolve, reject) => {
                superagent
                    .post(httpRequest.url)
                    .send(httpRequest.data)
                    .set(httpRequest.headers)
                    .end((error, res) => {
                    error ? reject(error) : resolve(res);
                });
            });
        else if (method == 'PUT')
            return new Promise((resolve, reject) => {
                superagent
                    .put(httpRequest.url)
                    .send(httpRequest.data)
                    .set(httpRequest.headers)
                    .end((error, res) => {
                    error ? reject(error) : resolve(res);
                });
            });
        else if (method == 'GET')
            return new Promise((resolve, reject) => {
                superagent
                    .get(httpRequest.url)
                    .set(httpRequest.headers)
                    .end((error, res) => {
                    error ? reject(error) : resolve(res);
                });
            });
        else if (method == 'DELETE')
            return new Promise((resolve, reject) => {
                superagent
                    .del(httpRequest.url)
                    .set(httpRequest.headers)
                    .end((error, res) => {
                    error ? reject(error) : resolve(res);
                });
            });
    }
}
exports.RxHttpClient = RxHttpClient;
