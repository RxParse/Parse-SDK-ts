"use strict";
var SDKPlugins_1 = require('../internal/SDKPlugins');
var _hasOwnProperty = Object.prototype.hasOwnProperty;
exports.has = function (obj, prop) {
    return _hasOwnProperty.call(obj, prop);
};
var RxAVObject = (function () {
    function RxAVObject(className) {
        this.className = className;
        this.dictionary = {};
    }
    RxAVObject.prototype.containsKey = function (key) {
        return exports.has(this.dictionary, key);
    };
    RxAVObject.prototype.set = function (key, value) {
        this.dictionary[key] = value;
    };
    RxAVObject.prototype.get = function (key) {
        return this.dictionary[key];
    };
    RxAVObject.prototype.save = function () {
        var _this = this;
        for (var key in this.dictionary) {
            var x = this.dictionary[key]; // x: boolean
            console.log(key, x);
        }
        return SDKPlugins_1.SDKPluginsInstance.ObjectControllerInstance.save(this, this.dictionary, '').map(function (project) {
            return _this.objectId != null;
        });
    };
    return RxAVObject;
}());
exports.RxAVObject = RxAVObject;
