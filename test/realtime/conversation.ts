import * as chai from 'chai';
import * as init from "../utils/init";
import { RxAVClient, RxAVObject, RxAVQuery, RxAVRole, RxAVUser, RxAVACL, RxAVRealtime, RxAVApp, RxAVIMConversation } from '../../src/RxLeanCloud';
import * as random from "../utils/random";
import { NodeJSWebSocketClient } from './NodeJSWebSocketClient';

init.init();

let realtime = new RxAVRealtime();

describe('AVRealtime', () => {

    before(function (beforDone) {
        realtime.connect('junwu').subscribe(connected => {
            console.log('connected', connected);
            beforDone();
        });
    });
    it('AVRealtime#createConversation', done => {
        let conversation = new RxAVIMConversation();
        conversation.set('open', true);
        conversation.members = ['junwu', 'weichi'];
        conversation.unique = false;
        conversation.name = '推翻赤匪';
        return realtime.create(conversation).subscribe(convCreated => {
            done();
        });;

    });
    // it('AVRealtime#getConversation', done => {
    //     realtime.connect('junwu').flatMap(connected => {
    //         return realtime.Conversation.name
    //     }).subscribe(convCreated => {
    //         console.log('convCreated', convCreated);
    //         done();
    //     });
    // });
});