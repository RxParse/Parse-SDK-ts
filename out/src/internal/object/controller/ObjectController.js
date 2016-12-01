"use strict";
var SDKPlugins_1 = require('../../SDKPlugins');
var HttpRequest_1 = require('../../httpClient/HttpRequest');
var RxAVClient_1 = require('../../../public/RxAVClient');
var ObjectController = (function () {
    function ObjectController() {
    }
    ObjectController.prototype.save = function (state, dictionary, sessionToken) {
        var request = new HttpRequest_1.HttpRequest();
        request.method = 'POST';
        request.data = dictionary;
        request.url = RxAVClient_1.RxAVClient.serverUrl() + "/classes/" + state.className;
        request.headers = RxAVClient_1.RxAVClient.headers();
        return SDKPlugins_1.SDKPluginsInstance.HttpClient.execute(request).map(function (tuple) {
            console.log('tuple', tuple);
            if (tuple[0] == 201) {
                if (tuple[1].createdAt) {
                    state.createdAt = tuple[1].createdAt;
                    state.updatedAt = tuple[1].createdAt;
                }
                if (tuple[1].updatedAt) {
                    state.updatedAt = tuple[1].updatedAt;
                }
                if (tuple[1].objectId) {
                    state.objectId = tuple[1].objectId;
                }
                state.isNew = false;
                return state;
            }
        });
    };
    return ObjectController;
}());
exports.ObjectController = ObjectController;
