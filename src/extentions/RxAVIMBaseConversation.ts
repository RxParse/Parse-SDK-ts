import { RxAVRealtime, RxAVIMConversation } from '../public/RxAVRealtime';
import { RxAVObject } from '../public/RxAVObject';
import { Observable } from 'rxjs';

export class RxAVIMBaseConversation extends RxAVObject {

    constructor(className: string) {
        super(className);
    }

    set tunnel(value: RxAVIMConversation | string) {
        if (value instanceof RxAVIMConversation) {
            this.set('tunnel', value);
        } else if (typeof value == 'string') {
            let con = new RxAVIMConversation();
            con.id = value;
            this.set('tunnel', con);
        }
    }

    get tunnel() {
        return this.get('tunnel');
    }

}