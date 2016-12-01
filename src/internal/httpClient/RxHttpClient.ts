import { Observable } from 'rxjs/Observable';
import { HttpRequest } from './HttpRequest';
import { iRxHttpClient } from './iRxHttpClient';
import { applicationId, applicationKey, serverUrl } from '../../public/RxAVClient';
import axios from 'axios';

export class RxHttpClient implements iRxHttpClient {
    version: number;
    constructor(version?: number) {
        this.version = version;
        if (this.version == 0)
            this.version = 1;
    }

    execute(httpRequest: HttpRequest): Observable<[number, any]> {
        return Observable.fromPromise(this.RxExecuteAxios(httpRequest)).map(res => {
            console.log('Observable.fromPromise');
            let rtn: [number, any] = [200, ''];
            rtn[0] = res.status;
            rtn[1] = res.data;
            return rtn;
        });
        //return this.RxExecuteSuperAgent(httpRequest);
    }
    RxExecuteAxios(httpRequest: HttpRequest) {
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
}
