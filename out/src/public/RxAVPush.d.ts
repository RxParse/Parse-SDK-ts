import { Observable } from 'rxjs';
import { RxAVQuery, RxAVUser } from '../RxLeanCloud';
/**
 * 一条推送消息
 *
 * @export
 * @class RxAVPush
 */
export declare class RxAVPush {
    query: RxAVQuery;
    channels: Array<string>;
    expiration: Date;
    pushTime: Date;
    expirationInterval: number;
    data: {
        [key: string]: any;
    };
    alert: string;
    prod: string;
    constructor();
    /**
     * 发送推送给符合查询条件的 _Installation
     *
     * @static
     * @param {(string | { [key: string]: any })} data
     * @param {{
     *         channels?: Array<string>,
     *         query?: RxAVQuery,
     *         prod?: string
     *     }} filter
     * @returns
     *
     * @memberOf RxAVPush
     */
    static sendContent(data: string | {
        [key: string]: any;
    }, filter: {
        channels?: Array<string>;
        query?: RxAVQuery;
        prod?: string;
    }): Observable<boolean>;
    /**
     * 向 RxAVUser 发送推送消息
     *
     * @static
     * @param {RxAVUser} user
     * @param {(string | { [key: string]: any })} data
     * @param {string} prod
     * @returns
     *
     * @memberOf RxAVPush
     */
    static sendTo(user: RxAVUser, data: string | {
        [key: string]: any;
    }, prod?: string): Observable<boolean>;
    /**
     * 发送
     *
     * @returns {Observable<boolean>}
     *
     * @memberOf RxAVPush
     */
    send(): Observable<boolean>;
    protected encode(): {
        [key: string]: any;
    };
}
