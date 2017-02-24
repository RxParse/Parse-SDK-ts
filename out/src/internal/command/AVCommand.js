"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var HttpRequest_1 = require("../httpClient/HttpRequest");
var RxLeanCloud_1 = require("../../RxLeanCloud");
var AVCommand = (function (_super) {
    __extends(AVCommand, _super);
    function AVCommand(options) {
        var _this = _super.call(this) || this;
        if (options != null) {
            _this.relativeUrl = options.relativeUrl;
            _this.url = RxLeanCloud_1.RxAVClient.currentConfig().serverUrl + _this.relativeUrl;
            _this.method = options.method;
            _this.data = options.data;
            _this.headers = RxLeanCloud_1.RxAVClient.headers();
            if (options.headers != null) {
                for (var key in options.headers) {
                    _this.headers[key] = options.headers[key];
                }
            }
            // if (RxAVUser.currentSessionToken != null) {
            //     this.headers['X-LC-Session'] = options.sessionToken;
            // }
            if (options.sessionToken != null) {
                _this.sessionToken = options.sessionToken;
                _this.headers['X-LC-Session'] = options.sessionToken;
            }
            if (options.contentType != null) {
                _this.contentType = options.contentType;
                _this.headers['Content-Type'] = options.contentType;
            }
        }
        return _this;
    }
    return AVCommand;
}(HttpRequest_1.HttpRequest));
exports.AVCommand = AVCommand;
