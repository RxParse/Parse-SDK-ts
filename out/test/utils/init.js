"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const RxLeanCloud_1 = require("../../src/RxLeanCloud");
const config_1 = require("./config");
RxLeanCloud_1.RxAVClient.init({
    appId: config_1.APP_ID,
    appKey: config_1.APP_KEY,
    region: config_1.REGION,
    log: true,
    pluginVersion: 2
});
