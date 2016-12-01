"use strict";
exports.version = '0.0.1';
var RxAVClient = (function () {
    function RxAVClient() {
    }
    RxAVClient.init = function (options) {
        exports.applicationId = options.appId;
        exports.applicationKey = options.appKey;
        exports.serverUrl = options.serverUrl != null ? options.serverUrl : 'https://api.leancloud.cn/1.1';
    };
    RxAVClient.headers = function () {
        if (RxAVClient._headers == null)
            RxAVClient._headers = {
                'X-LC-Id': exports.applicationId,
                'X-LC-Key': exports.applicationKey,
                'Content-Type': 'application/json',
                'User-Agent': 'ts-sdk/' + exports.version,
            };
        return RxAVClient._headers;
    };
    RxAVClient.serverUrl = function () {
        return exports.serverUrl;
    };
    return RxAVClient;
}());
exports.RxAVClient = RxAVClient;
