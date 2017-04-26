"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const HttpRequest_1 = require("../httpClient/HttpRequest");
const RxLeanCloud_1 = require("../../RxLeanCloud");
class AVCommand extends HttpRequest_1.HttpRequest {
    constructor(options) {
        super();
        this.data = {};
        if (options != null) {
            this.relativeUrl = options.relativeUrl;
            let apiVersion = '1.1';
            if (this.relativeUrl == null || typeof this.relativeUrl == 'undefined')
                throw new Error('command must have a relative url.');
            this.url = `${RxLeanCloud_1.RxAVClient.instance.currentConfiguration.server.api}/${apiVersion}`;
            if (RxLeanCloud_1.RxAVClient.instance.currentConfiguration.region == 'cn') {
                this.url = `https://${RxLeanCloud_1.RxAVClient.instance.appRouterState.ApiServer}/${apiVersion}${this.relativeUrl}`;
                if (this.relativeUrl.startsWith('/push') || this.relativeUrl.startsWith('/installations')) {
                    this.url = `https://${RxLeanCloud_1.RxAVClient.instance.appRouterState.PushServer}/${apiVersion}${this.relativeUrl}`;
                    if (RxLeanCloud_1.RxAVClient.instance.currentConfiguration.server.push != null) {
                        this.url = `https://${RxLeanCloud_1.RxAVClient.instance.currentConfiguration.server.push}/${apiVersion}${this.relativeUrl}`;
                    }
                }
                else if (this.relativeUrl.startsWith('/stats')
                    || this.relativeUrl.startsWith('/always_collect')
                    || this.relativeUrl.startsWith('/statistics')) {
                    this.url = `https://${RxLeanCloud_1.RxAVClient.instance.appRouterState.StatsServer}/${apiVersion}${this.relativeUrl}`;
                    if (RxLeanCloud_1.RxAVClient.instance.currentConfiguration.server.stats != null) {
                        this.url = `https://${RxLeanCloud_1.RxAVClient.instance.currentConfiguration.server.stats}/${apiVersion}${this.relativeUrl}`;
                    }
                }
                else if (this.relativeUrl.startsWith('/functions')
                    || this.relativeUrl.startsWith('/call')) {
                    this.url = `https://${RxLeanCloud_1.RxAVClient.instance.appRouterState.EngineServer}/${apiVersion}${this.relativeUrl}`;
                    if (RxLeanCloud_1.RxAVClient.instance.currentConfiguration.server.engine != null) {
                        this.url = `https://${RxLeanCloud_1.RxAVClient.instance.currentConfiguration.server.engine}/${apiVersion}${this.relativeUrl}`;
                    }
                }
            }
            this.method = options.method;
            this.data = options.data;
            this.headers = RxLeanCloud_1.RxAVClient.headers();
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
    attribute(key, value) {
        this.data[key] = value;
        return this;
    }
}
exports.AVCommand = AVCommand;
