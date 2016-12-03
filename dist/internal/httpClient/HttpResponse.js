"use strict";
var HttpResponse = (function () {
    function HttpResponse(option) {
        if (option != null) {
            this.satusCode = option[0];
            this.body = option[1];
        }
    }
    Object.defineProperty(HttpResponse.prototype, "jsonBody", {
        get: function () {
            return JSON.parse(this.body);
        },
        enumerable: true,
        configurable: true
    });
    return HttpResponse;
}());
exports.HttpResponse = HttpResponse;
