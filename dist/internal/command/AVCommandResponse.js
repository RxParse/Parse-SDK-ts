"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const HttpResponse_1 = require("../httpClient/HttpResponse");
class AVCommandResponse extends HttpResponse_1.HttpResponse {
    constructor(base) {
        super();
        this.body = base.body;
        this.satusCode = base.satusCode;
    }
}
exports.AVCommandResponse = AVCommandResponse;
