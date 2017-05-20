import { HttpRequest } from '../httpClient/HttpRequest';
import { RxAVClient, RxAVUser, RxAVApp } from '../../RxLeanCloud';

export class AVCommand extends HttpRequest {
    relativeUrl: string;
    sessionToken: string;
    contentType: string;

    constructor(options?: any) {
        super();
        this.data = {};
        if (options != null) {
            this.relativeUrl = options.relativeUrl;

            let apiVersion = '1.1';
            if (this.relativeUrl == null || typeof this.relativeUrl == 'undefined') throw new Error('command must have a relative url.');
            let protocol = 'https://';
            let app = RxAVClient.instance.currentApp;

            if (options.app != null) {
                app = options.app;
            }

            if (app.region == 'cn') {
                this.url = `${app.api}/${apiVersion}${this.relativeUrl}`;
                if (this.relativeUrl.startsWith('/push') || this.relativeUrl.startsWith('/installations')) {
                    this.url = `${app.push}/${apiVersion}${this.relativeUrl}`;
                } else if (this.relativeUrl.startsWith('/stats')
                    || this.relativeUrl.startsWith('/always_collect')
                    || this.relativeUrl.startsWith('/statistics')) {
                    this.url = `${app.stats}/${apiVersion}${this.relativeUrl}`;
                } else if (this.relativeUrl.startsWith('/functions')
                    || this.relativeUrl.startsWith('/call')) {
                    this.url = `${app.engine}/${apiVersion}${this.relativeUrl}`;
                }
            }
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
                this.headers['X-LC-Session'] = options.sessionToken;
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
}