import { ParseClient, ParseAppConfig, ParseApp } from '../../src/RxParse';
import { NodeJSWebSocketClient } from '../WebSocket/NodeJSWebSocketClient';
let app = new ParseApp({
    appId: `parse`,
    serverURL: 'https://chigua.live/api/'
});

import {
    APP_ID,
    APP_KEY,
    REGION,
} from './config';

export function init() {
    ParseClient.init({
        pluginVersion: 1,
        log: true,
        plugins: {
            websocket: new NodeJSWebSocketClient()
        }
    }).add(app);
}

