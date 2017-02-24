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
var HttpResponse_1 = require("../httpClient/HttpResponse");
var AVCommandResponse = (function (_super) {
    __extends(AVCommandResponse, _super);
    function AVCommandResponse(base) {
        var _this = _super.call(this) || this;
        _this.body = base.body;
        _this.satusCode = base.satusCode;
        return _this;
    }
    return AVCommandResponse;
}(HttpResponse_1.HttpResponse));
exports.AVCommandResponse = AVCommandResponse;
