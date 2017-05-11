"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const SDKPlugins_1 = require("../internal/SDKPlugins");
const RxLeanCloud_1 = require("../RxLeanCloud");
class RxLeanEngine {
    static get LeanEngineController() {
        return SDKPlugins_1.SDKPlugins.instance.LeanEngineControllerInstance;
    }
    /**
     * 调用云函数
     *
     * @static
     * @param {string} name 云函数 name
     * @param {Object} [parameters] 参数字典:{{ [key: string]: any }}
     * @returns {Observable<Object>}
     *
     * @memberOf RxLeanEngine
     */
    static callFunction(name, parameters, app) {
        return RxLeanEngine.LeanEngineController.callFunction(name, parameters, RxLeanCloud_1.RxAVUser.currentSessionToken);
    }
}
exports.RxLeanEngine = RxLeanEngine;
