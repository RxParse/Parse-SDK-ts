import { HttpRequest } from '../httpClient/HttpRequest';
import { RxAVClient, RxAVUser } from '../../RxLeanCloud';

export class AVCommand extends HttpRequest {
    relativeUrl: string;
    sessionToken: string;
    contentType: string;

    constructor(options?: any) {
        super();
        this.data = {};
        if (options != null) {
            this.relativeUrl = options.relativeUrl;
            if (this.relativeUrl == null || typeof this.relativeUrl == 'undefined') throw new Error('command must have a relative url.');

            this.url = `https://${RxAVClient.instance.appRouterState.ApiServer}/1.1${this.relativeUrl}`;
            if (this.relativeUrl.startsWith('/push') || this.relativeUrl.startsWith('/installations')) {
                this.url = `https://${RxAVClient.instance.appRouterState.PushServer}/1.1${this.relativeUrl}`;
            } else if (this.relativeUrl.startsWith('/stats')
                || this.relativeUrl.startsWith('/always_collect')
                || this.relativeUrl.startsWith('/statistics')) {
                this.url = `https://${RxAVClient.instance.appRouterState.StatsServer}/1.1${this.relativeUrl}`;
            } else if (this.relativeUrl.startsWith('/functions')
                || this.relativeUrl.startsWith('/call')) {
                this.url = `https://${RxAVClient.instance.appRouterState.EngineServer}/1.1${this.relativeUrl}`;
            }
            this.method = options.method;
            this.data = options.data;
            this.headers = RxAVClient.headers();
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