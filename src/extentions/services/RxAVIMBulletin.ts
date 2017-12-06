import { RxAVRealtime, RxAVIMConversation } from '../../public/RxAVRealtime';
import { RxAVObject } from '../../public/RxAVObject';
import { RxAVLiveQuery, RxAVQuery } from '../../public/RxAVQuery';
import { Observable } from 'rxjs';
import { RxAVIMBaseConversation } from '../RxAVIMBaseConversation';
import { RxAVUser } from '../../public/RxAVUser';

export class RxAVIMBulletin extends RxAVObject {

    constructor(consumer: RxAVObject) {
        let currentClassName = RxAVIMBulletin.getClassName(consumer);
        super(currentClassName);
        this.set(RxAVIMBulletin._consumerKey, consumer);
    }

    private static _claseNameSuffix = 'rxBulletin';
    private static _consumerKey = 'rxConsumer';
    private static _titleKey = 'rxTitle';
    private static _contentKey = 'rxContent';
    private static _authorKey = 'rxAuthor';

    public static listen<T extends RxAVObject>(consumer: T) {
        let query = new RxAVQuery(RxAVIMBulletin.getClassName(consumer));
        query.equalTo(RxAVIMBulletin._consumerKey, consumer);
        return query.subscribe();
    }

    get title(): string {
        return this.get(RxAVIMBulletin._titleKey) as string;
    }

    set title(value: string) {
        this.set(RxAVIMBulletin._titleKey, value);
    }

    get content(): any {
        return this.get(RxAVIMBulletin._contentKey) as any;
    }

    set content(value: any) {
        this.set(RxAVIMBulletin._contentKey, value);
    }

    get author(): RxAVUser {
        return this.get(RxAVIMBulletin._authorKey) as RxAVUser;
    }

    set author(value: RxAVUser) {
        this.set(RxAVIMBulletin._authorKey, value);
    }

    public static create<T extends RxAVObject>(consumer: T): RxAVIMBulletin {
        let bulletin = new RxAVIMBulletin(consumer);
        return bulletin;
    }

    public publish() {
        return this.save();
    }

    public static history<T extends RxAVObject>(consumer: T): Observable<RxAVIMBulletin[]> {
        let query = new RxAVQuery(RxAVIMBulletin.getClassName(consumer));
        query.equalTo(RxAVIMBulletin._consumerKey, consumer);
        return query.find().map(objs => {
            return objs.map(obj => {
                return obj as RxAVIMBulletin;
            });
        });
    }

    public static latest<T extends RxAVObject>(consumer: T): Observable<RxAVIMBulletin> {
        let query = new RxAVQuery(RxAVIMBulletin.getClassName(consumer));
        query.equalTo(RxAVIMBulletin._consumerKey, consumer);
        query.descending('updatedAt');
        query.limit(1);
        return query.find().map(objs => {
            if (objs.length > 0) {
                return objs[0] as RxAVIMBulletin;
            } else {
                return undefined;
            }
        });
    }

    private static getClassName<T extends RxAVObject>(consumer: T) {
        return `${consumer.className}_${RxAVIMBulletin._claseNameSuffix}`;
    }
}