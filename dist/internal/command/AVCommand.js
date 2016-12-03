"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var HttpRequest_1 = require('../httpClient/HttpRequest');
var RxAVClient_1 = require('../../public/RxAVClient');
var AVCommand = (function (_super) {
    __extends(AVCommand, _super);
    function AVCommand(options) {
        _super.call(this);
        if (options != null) {
            this.relativeUrl = options.relativeUrl;
            this.url = RxAVClient_1.RxAVClient.currentConfig().serverUrl + this.relativeUrl;
            this.method = options.method;
            this.data = options.data;
            this.headers = RxAVClient_1.RxAVClient.headers();
            if (options.headers != null) {
                for (var key in options.headers) {
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
    return AVCommand;
}(HttpRequest_1.HttpRequest));
exports.AVCommand = AVCommand;
