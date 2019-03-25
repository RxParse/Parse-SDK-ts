import { ParseClient, ParseAppConfig, ParseApp } from '../../src/RxParse';
import { NodeJSWebSocketClient } from '../WebSocket/NodeJSWebSocketClient';

import {
    APP_ID,
    APP_KEY,
    SERVER_URL,
} from './config';

let app = new ParseApp({
    appId: APP_ID,
    appKey: APP_KEY,
    serverURL: SERVER_URL
});


export function init() {
    ParseClient.init({
        pluginVersion: 1,
        log: true,
        plugins: {
            websocket: new NodeJSWebSocketClient()
        }
    }).add(app);
}

