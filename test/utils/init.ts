import { RxAVClient, RxAVApp } from '../../src/RxLeanCloud';
import { PCInfo } from '../analytics/PCInfo';
import { NodeJSWebSocketClient } from '../realtime/NodeJSWebSocketClient';
let app = new RxAVApp({
    appId: `uay57kigwe0b6f5n0e1d4z4xhydsml3dor24bzwvzr57wdap`,
    appKey: `kfgz7jjfsk55r5a8a3y4ttd3je1ko11bkibcikonk32oozww`,
});
let app2 = new RxAVApp({
    appId: `1kz3x4fkhvo0ihk967hxdnlfk4etk754at9ciqspjmwidu1t`,
    appKey: `14t4wqop50t4rnq9e99j2b9cyg51o1232ppzzc1ia2u5e05e`,
    shortname: `dev`
});
let qcloudApp3 = new RxAVApp({
    appId: `JXyR8vfpeSr8cfaYnob2zYl0-9Nh9j0Va`,
    appKey: `Fgq2YlPdnP1KJEoWyF5tk2az`,
    shortname: 'qcloud'
});
import {
    APP_ID,
    APP_KEY,
    REGION,
} from './config';

export function init() {
    RxAVClient.init({
        pluginVersion: 1,
        log: true,
        plugins: {
            websocket: new NodeJSWebSocketClient(),
            device: new PCInfo()
        }
    }).add(app).add(app2).add(qcloudApp3, true);
}

