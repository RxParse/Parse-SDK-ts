import { HttpRequest } from '../httpClient/HttpRequest';
import { RxAVClient, RxAVUser } from '../../RxLeanCloud';

export class AVCommand extends HttpRequest {
    relativeUrl: string;
    sessionToken: string;
    contentType: string;

    constructor(options?: any) {
        super();
        if (options != null) {
            this.relativeUrl = options.relativeUrl;
            this.url = RxAVClient.currentConfig().serverUrl + this.relativeUrl;
            this.method = options.method;
            this.data = options.data;
            this.headers = RxAVClient.headers();
            if (options.headers != null) {
                for (let key in options.headers) {
                    this.headers[key] = options.headers[key];
                }
            }
            // if (RxAVUser.currentSessionToken != null) {
            //     this.headers['X-LC-Session'] = options.sessionToken;
            // }
            if (options.sessionToken != null) {
                this.sessionToken = options.sessionToken;
                this.headers['X-LC-Session'] = options.sessionToken;
            }
            if (options.contentType != null) {
                this.contentType = options.contentType;
                this.headers['Content-Type'] = options.contentType;
            }

        }
    }
}