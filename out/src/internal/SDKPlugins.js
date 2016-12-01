"use strict";
var RxHttpClient_1 = require('./httpClient/RxHttpClient');
var ObjectController_1 = require('./object/controller/ObjectController');
var SDKPlugins = (function () {
    function SDKPlugins() {
    }
    Object.defineProperty(SDKPlugins.prototype, "HttpClient", {
        get: function () {
            if (this._HttpClient == null) {
                this._HttpClient = new RxHttpClient_1.RxHttpClient();
            }
            return this._HttpClient;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SDKPlugins.prototype, "ObjectControllerInstance", {
        get: function () {
            if (this._ObjectController == null) {
                this._ObjectController = new ObjectController_1.ObjectController();
            }
            return this._ObjectController;
        },
        enumerable: true,
        configurable: true
    });
    return SDKPlugins;
}());
exports.SDKPlugins = SDKPlugins;
exports.SDKPluginsInstance = new SDKPlugins();
