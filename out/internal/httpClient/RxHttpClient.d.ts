/// <reference types="superagent" />
import { Observable } from 'rxjs';
import { HttpRequest } from './HttpRequest';
import { HttpResponse } from './HttpResponse';
import { IRxHttpClient } from './iRxHttpClient';
import { AxiosPromise } from 'axios';
import * as superagent from 'superagent';
export declare class RxHttpClient implements IRxHttpClient {
    version: number;
    constructor(version?: number);
    execute(httpRequest: HttpRequest): Observable<HttpResponse>;
    RxExecuteAxios(httpRequest: HttpRequest): AxiosPromise;
    RxExecuteSuperagent(httpRequest: HttpRequest): Promise<superagent.Response>;
}
