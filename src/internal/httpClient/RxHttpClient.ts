import { Observable } from 'rxjs';
import { HttpRequest } from './HttpRequest';
import { iRxHttpClient } from './iRxHttpClient';
import axios, { AxiosRequestConfig, AxiosPromise } from 'axios';
import * as superagent from 'superagent';
import { RxAVClient } from '../../public/RxAVClient';

export class RxHttpClient implements iRxHttpClient {
    version: number;
    constructor(version?: number) {
        this.version = version;
    }

    execute(httpRequest: HttpRequest): Observable<[number, any]> {
        if (RxAVClient.isNode() && this.version == 1)
            return Observable.fromPromise(this.RxExecuteAxios(httpRequest)).map(res => {
                RxAVClient.printLog('http client:axios');
                let rtn: [number, any] = [200, ''];
                rtn[0] = res.status;
                rtn[1] = res.data;
                return rtn;
            });
        else return Observable.fromPromise(this.RxExecuteSuperagent(httpRequest)).map(res => {
            RxAVClient.printLog('http client:superagent');
            let rtn: [number, any] = [200, ''];
            rtn[0] = res.status;
            rtn[1] = res.body;
            return rtn;
        });
        //return this.RxExecuteSuperAgent(httpRequest);
    }
    RxExecuteAxios(httpRequest: HttpRequest): AxiosPromise {
        console.log('RxExecuteAxios');
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
