import { RxAVRealtime, RxAVIMConversation } from '../public/RxAVRealtime';
import { RxAVObject } from '../public/RxAVObject';
import { Observable } from 'rxjs';
import { RxAVIMBulletin } from '../extentions/services';
import { RxAVIMBaseConversation } from './RxAVIMBaseConversation';

export class RxAVIMExtGroupChat extends RxAVIMBaseConversation {
    
    bulletins: RxAVIMBulletin[];
    constructor() {
        super(RxAVIMExtGroupChat._rxAVIMExtGroupChatClassName);
    }
    private static _rxAVIMExtGroupChatClassName = 'RxAVIMExtGroupChat';
}