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
    /**
     * 调用云函数
     *
     * @static
     * @param {string} name 云函数 name
     * @param {{ [key: string]: any }} [parameters] 参数字典
     * @returns
     *
     * @memberOf RxLeanEngine
     */
    RxLeanEngine.callFunction = function (name, parameters) {
        return RxLeanEngine.LeanEngineController.callFunction(name, parameters, RxLeanCloud_1.RxAVUser.currentSessionToken);
    };
    return RxLeanEngine;
}());
exports.RxLeanEngine = RxLeanEngine;
