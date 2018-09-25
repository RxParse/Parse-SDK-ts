import { HttpRequest } from '../httpClient/HttpRequest';
import { ParseClient } from '../../RxParse';

export class ParseCommand extends HttpRequest {
    relativeUrl: string;
    sessionToken: string;
    contentType: string;

    constructor(options?: any) {
        super();
        this.data = {};
        if (options != null) {
            this.relativeUrl = options.relativeUrl;
            if (this.relativeUrl == null || typeof this.relativeUrl == 'undefined') throw new Error('command must have a relative url.');
            let app = ParseClient.instance.currentApp;

            if (options.app != null) {
                app = options.app;
            }
            this.url = `${app.pureServerURL}/${this.clearHeadSlashes(this.relativeUrl)}`;
            this.url = encodeURI(this.url);
            this.method = options.method;
            this.data = options.data;
            this.headers = app.httpHeaders;
            if (options.headers != null) {
                for (let key in options.headers) {
                    this.headers[key] = options.headers[key];
                }
            }
            if (options.sessionToken != null) {
                this.sessionToken = options.sessionToken;
                this.headers['X-Parse-Session-Token'] = options.sessionToken;
            }
            if (options.contentType != null) {
                this.contentType = options.contentType;
                this.headers['Content-Type'] = options.contentType;
            }
        }
    }

    attribute(key: string, value: any) {
        this.data[key] = value;
        return this;
    }

    clearHeadSlashes(url: string): string {
        if (url.startsWith('/')) {
            url = url.substring(1, url.length);
            return this.clearHeadSlashes(url);
        }
        else
            return url;
    }
}