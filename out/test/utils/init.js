"use strict";
var RxLeanCloud_1 = require('../../src/RxLeanCloud');
var config_1 = require('./config');
RxLeanCloud_1.RxAVClient.init({
    appId: config_1.APP_ID,
    appKey: config_1.APP_KEY,
    log: true,
    pluginVersion: 1
});
