import { Observable } from 'rxjs';
import { HttpRequest } from './HttpRequest';
import { HttpResponse } from './HttpResponse';
import { IRxHttpClient } from './iRxHttpClient';
import axios, { AxiosRequestConfig, AxiosPromise } from 'axios';
import * as superagent from 'superagent';
import { RxAVClient } from '../../public/RxAVClient';

export class RxHttpClient implements IRxHttpClient {
    version: number;
    constructor(version?: number) {
        this.version = version;
    }

    execute(httpRequest: HttpRequest): Observable<HttpResponse> {
        let tuple: [number, any] = [200, ''];
        let errMsg = {
            statusCode: -1,
            error: { code: 0, error: 'Server error' }
        };
        let response = new HttpResponse(tuple);
        RxAVClient.printLog('Request:', JSON.stringify(httpRequest));
        if (RxAVClient.isNode() && this.version == 1)
            return Observable.fromPromise(this.RxExecuteAxios(httpRequest)).map(res => {
                RxAVClient.printLog('http client:axios');
                tuple[0] = res.status;
                tuple[1] = res.data;
                let response = new HttpResponse(tuple);
                RxAVClient.printLog('Response:', JSON.stringify(response));
                return response;
            }).catch((err: any) => {
                if (err) {
                    errMsg.statusCode = err.response.status;
                    errMsg.error = err.response.data;
                }
                RxAVClient.printLog('Error:', JSON.stringify(errMsg));
                return Observable.throw(errMsg);
            });
        else return Observable.fromPromise(this.RxExecuteSuperagent(httpRequest)).map(res => {
            RxAVClient.printLog('http client:superagent');
            tuple[0] = res.status;
            tuple[1] = res.body;
            let response = new HttpResponse(tuple);
            RxAVClient.printLog('Response:', JSON.stringify(response));
            return response;
        }).catch((err: any) => {
            if (err) {
                errMsg.statusCode = err.status;
                errMsg.error = JSON.parse(err.response.text);
            }
            RxAVClient.printLog('Error:', JSON.stringify(errMsg));
            return Observable.throw(errMsg);
        });
    }
    RxExecuteAxios(httpRequest: HttpRequest): AxiosPromise {
        let method = httpRequest.method.toUpperCase();
        let useData = false;
        if (method == 'PUT' || 'POST') {
            useData = true;
        }
        return axios({
            method: method,
            url: httpRequest.url,
            data: useData ? httpRequest.data : null,
            headers: httpRequest.headers
        });
    }
    RxExecuteSuperagent(httpRequest: HttpRequest): Promise<superagent.Response> {
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
