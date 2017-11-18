import { Observable } from 'rxjs';
import { RxAVRealtime } from '../../public/RxAVRealtime';

export interface IRxAVIMReceivable {
    onRecevived: Observable<any>;
}

export class RxAVIMReceivable implements IRxAVIMReceivable {
    constructor(realtime: RxAVRealtime, convId: string) {
        this.bindRealtime(realtime, convId);
    }
    onRecevived: Observable<any>;

    bindRealtime(realtime: RxAVRealtime, convId: string) {
        this.onRecevived = realtime.onMessage.filter(message => {
            return message.convId == convId;
        });
    }
}