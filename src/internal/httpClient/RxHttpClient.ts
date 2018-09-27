import { map, catchError } from 'rxjs/operators';
import { Observable, from } from 'rxjs';
import { HttpRequest } from './HttpRequest';
import { HttpResponse } from './HttpResponse';
import { IRxHttpClient } from './IRxHttpClient';
import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import * as superagent from 'superagent';
import { ParseClient } from 'public/RxParseClient';

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
        ParseClient.printLog('Request:', JSON.stringify(httpRequest));
        if (ParseClient.instance.currentConfiguration.isNode && this.version == 1) {
            ParseClient.printLog('http client:axios');
            return from(this.RxExecuteAxios(httpRequest)).pipe(map(res => {

                tuple[0] = res.status;
                tuple[1] = res.data;
                response = new HttpResponse(tuple);
                ParseClient.printLog('Response:', JSON.stringify(response));
                return response;
            }), catchError((err: any) => {
                ParseClient.printLog('Meta Error:', err);
                if (err) {
                    errMsg.statusCode = err.response.status;
                    errMsg.error = err.response.data;
                }
                ParseClient.printLog('Error:', JSON.stringify(errMsg));
                return Observable.throw(errMsg);
            }));
        }

        else {
            ParseClient.printLog('http client:superagent');
            return from(this.RxExecuteSuperagent(httpRequest)).pipe(map(res => {
                tuple[0] = res.status;
                tuple[1] = res.body;
                let response = new HttpResponse(tuple);
                ParseClient.printLog('Response:', JSON.stringify(response));
                return response;
            }), catchError((err: any) => {
                ParseClient.printLog('Meta Error:', err);
                if (err) {
                    errMsg.statusCode = err.status;
                    errMsg.error = JSON.parse(err.response.text);
                }
                ParseClient.printLog('Error:', errMsg);
                return Observable.throw(errMsg);
            }));
        }
    }

    RxExecuteAxios(httpRequest: HttpRequest): Promise<AxiosResponse> {
        let method = httpRequest.method.toUpperCase();
        let useData = false;
        if (method == 'PUT' || 'POST') {
            useData = true;
        }
        return new Promise<AxiosResponse>((resolve, reject) => {
            axios({
                method: method,
                url: httpRequest.url,
                data: useData ? httpRequest.data : null,
                headers: httpRequest.headers
            }).then(response => {
                resolve(response);
            }).catch(error => {
                reject(error);
            });
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
