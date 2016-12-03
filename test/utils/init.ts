import { RxAVClient } from '../../src/RxLeanCloud';
import {
    APP_ID,
    APP_KEY,
    REGION,
} from './config';

RxAVClient.init({
    appId: APP_ID,
    appKey: APP_KEY,
    log: true,
    pluginVersion: 1
});