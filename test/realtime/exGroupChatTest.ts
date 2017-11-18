import * as chai from 'chai';
import * as init from "../utils/init";
import { RxAVClient, RxAVObject, RxAVQuery, RxAVRole, RxAVUser, RxAVACL, RxAVRealtime, RxAVApp, RxAVIMConversation, ExtRXAVIMGroupChat } from '../../src/RxLeanCloud';
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
    it('AVRealtime#createGroupChat', done => {
        let groupChat = new ExtRXAVIMGroupChat();
        groupChat.admins = ['junwu', 'weichi'];
        groupChat.name = 'ExtRXAVIMGroupChat';
        groupChat.metaConversation.members = ['junwu', 'weichi'];
        groupChat.realtimne = realtime;
        return groupChat.create().subscribe(groupChatCreated => {
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