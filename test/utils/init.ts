import { RxParseClient, ParseApp } from '../../src/RxParse';
import { PCInfo } from '../analytics/PCInfo';
import { NodeJSWebSocketClient } from '../realtime/NodeJSWebSocketClient';
let app = new ParseApp({
    appId: `bas`,
    appKey: `basKey`,
    additionalHeaders: {
        'X-Parse-Application-Id': `bas`
    },
    server: {
        api: 'https://chigua.live/api',
    }
});
let app2 = new ParseApp({
    appId: `1kz3x4fkhvo0ihk967hxdnlfk4etk754at9ciqspjmwidu1t`,
    appKey: `14t4wqop50t4rnq9e99j2b9cyg51o1232ppzzc1ia2u5e05e`,
    shortname: `dev`
});
let qcloudApp3 = new ParseApp({
    appId: `cfpwdlo41ujzbozw8iazd8ascbpoirt2q01c4adsrlntpvxr`,
    appKey: `lmar9d608v4qi8rvc53zqir106h0j6nnyms7brs9m082lnl7`,
});
import {
    APP_ID,
    APP_KEY,
    REGION,
} from './config';

export function init() {
    RxParseClient.init({
        pluginVersion: 1,
        log: true,
        plugins: {
            websocket: new NodeJSWebSocketClient(),
            device: new PCInfo()
        }
    }).add(app).add(app2).add(qcloudApp3);
}

