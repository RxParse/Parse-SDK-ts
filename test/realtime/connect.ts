import * as chai from 'chai';
import * as init from "../utils/init";
import { RxAVClient, RxAVObject, RxAVQuery, RxAVRole, RxAVUser, RxAVACL, RxAVRealtime, RxAVApp, RxAVIMConversation } from '../../src/RxLeanCloud';
import * as random from "../utils/random";
import { NodeJSWebSocketClient } from './NodeJSWebSocketClient';

init.init();

let realtime = new RxAVRealtime();

describe('AVRealtime', () => {

    it('AVRealtime#connect', done => {
        realtime.connect('junwu').subscribe(connectd => {
            console.log('convCreated', connectd);
            done();
        });
    });
});