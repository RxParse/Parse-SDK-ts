"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var HttpResponse_1 = require('../httpClient/HttpResponse');
var AVCommandResponse = (function (_super) {
    __extends(AVCommandResponse, _super);
    function AVCommandResponse(base) {
        _super.call(this);
        this.body = base.body;
        this.satusCode = base.satusCode;
    }
    return AVCommandResponse;
}(HttpResponse_1.HttpResponse));
exports.AVCommandResponse = AVCommandResponse;
