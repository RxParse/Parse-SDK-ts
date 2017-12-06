import {
    IRxAVIMMemberModifiable,
    IRXAVIMProperties,
    RXAVIMProperties,
    IRxAVIMReceivable,
    RxAVIMReceivable,
    IRxAVIMSendable,
    IRxAVIMCreatable
} from './components';

import { RxAVRealtime, RxAVIMConversation } from '../public/RxAVRealtime';
import { RxAVObject } from '../public/RxAVObject';
import { Observable } from 'rxjs';


export class RXAVIMGroupChat implements IRxAVIMReceivable, IRxAVIMCreatable, IRXAVIMProperties {

    constructor() {
        this.iRXAVIMProperties = new RXAVIMProperties();
        this.metaConversation = new RxAVIMConversation();
        this.metaConversation.unique = false;
    }
    saveProperties(): Observable<boolean> {
        return this.iRXAVIMProperties.saveProperties();
    }

    get topics(): any[] {
        return this.iRXAVIMProperties.topics;
    }
    set topics(value: any[]) {
        this.iRXAVIMProperties.topics = value;
    }

    get bulletins(): any[] {
        return this.iRXAVIMProperties.bulletins;
    }
    set bulletins(value: any[]) {
        this.iRXAVIMProperties.bulletins = value;
    }

    get name(): string {
        return this.iRXAVIMProperties.name;
    }
    set name(value: string) {
        this.iRXAVIMProperties.name = value;
    }

    get creator(): string {
        return this.metaConversation.creator;
    }

    get owner(): string {
        return this.iRXAVIMProperties.owner;
    }
    set owner(value: string) {
        this.iRXAVIMProperties.owner = value;
    }

    get admins(): string[] {
        return this.iRXAVIMProperties.admins;
    }
    set admins(value: string[]) {
        this.iRXAVIMProperties.admins = value;
    }
    get onUpdated(): Observable<any> {
        return this.iRXAVIMProperties.onUpdated;
    }
    set onUpdated(value: Observable<any>) {
        this.iRXAVIMProperties.onUpdated = value;
    }
    get metaPropertyObject(): RxAVObject {
        return this.iRXAVIMProperties.metaPropertyObject;
    }
    set metaPropertyObject(value: RxAVObject) {
        this.iRXAVIMProperties.metaPropertyObject = value;
    }
    metaConversation: RxAVIMConversation;

    create(): Observable<boolean> {
        this.metaConversation.set('root', RXAVIMProperties._rxAVIMPropertiesClassName);
        return this.realtimne.create(this.metaConversation).map(convesation => {
            this.convId = convesation.id;
            return convesation.id;
        }).flatMap(covId => {
            this.iRXAVIMProperties.metaPropertyObject.set('conv', this.metaConversation);
            return this.iRXAVIMProperties.saveProperties();
        });
    }
    onRecevived: Observable<any>;
    realtimne: RxAVRealtime;
    iRxAVIMReceivable: IRxAVIMReceivable;
    iRXAVIMProperties: IRXAVIMProperties;
    convId: string;

    public static fromData(convId: string, realtimne: RxAVRealtime) {
        let channel = new RXAVIMGroupChat();
        channel.convId = convId;
        channel.realtimne = realtimne;
        channel.iRxAVIMReceivable = new RxAVIMReceivable(channel.realtimne, channel.convId);
        channel.onRecevived = channel.iRxAVIMReceivable.onRecevived;

        return channel;
    }
}

