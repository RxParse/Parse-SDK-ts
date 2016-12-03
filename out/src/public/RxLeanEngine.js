"use strict";
var SDKPlugins_1 = require('../internal/SDKPlugins');
var RxLeanCloud_1 = require('../RxLeanCloud');
var RxLeanEngine = (function () {
    function RxLeanEngine() {
    }
    Object.defineProperty(RxLeanEngine, "LeanEngineController", {
        get: function () {
            return SDKPlugins_1.SDKPlugins.instance.LeanEngineControllerInstance;
        },
        enumerable: true,
        configurable: true
    });
    RxLeanEngine.callFunction = function (name, parameters) {
        return RxLeanEngine.LeanEngineController.callFunction(name, parameters, RxLeanCloud_1.RxAVUser.currentSessionToken);
    };
    return RxLeanEngine;
}());
exports.RxLeanEngine = RxLeanEngine;
