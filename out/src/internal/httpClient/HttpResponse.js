"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class HttpResponse {
    constructor(option) {
        if (option != null) {
            this.satusCode = option[0];
            this.body = option[1];
        }
    }
    get jsonBody() {
        return JSON.parse(this.body);
    }
}
exports.HttpResponse = HttpResponse;
