"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const RxLeanCloud_1 = require("../RxLeanCloud");
/**
 * 一条推送消息
 *
 * @export
 * @class RxAVPush
 */
class RxAVPush {
    constructor() {
        this.query = new RxLeanCloud_1.RxAVQuery('_Installation');
    }
    /**
     * 发送推送给符合查询条件的 _Installation
     *
     * @static
     * @param {Object} data:{(string | { [key: string]: any })}
     * @param {Object} filter:{{
     *         channels?: Array<string>,
     *         query?: RxAVQuery,
     *         prod?: string
     *     }}
     * @returns {Observable<boolean>} 返回是否成功刚发送
     *
     * @memberOf RxAVPush
     */
    static sendContent(data, filter) {
        let push = new RxAVPush();
        if (typeof data === 'string') {
            push.alert = data;
        }
        else {
            push.data = data;
        }
        if (filter.channels)
            push.channels = filter.channels;
        if (filter.query)
            push.query = filter.query;
        if (filter.prod) {
            push.prod = filter.prod;
        }
        return push.send();
    }
    /**
     * 向 RxAVUser 发送推送消息
     *
     * @static
     * @param {RxAVUser} user
     * @param {any} data:{(string | { [key: string]: any })}
     * @param {string} prod
     * @returns {Observable<boolean>} 返回是否成功刚发送
     *
     * @memberOf RxAVPush
     */
    static sendTo(user, data, prod) {
        let query = new RxLeanCloud_1.RxAVQuery('_Installation');
        query.relatedTo(user, RxLeanCloud_1.RxAVUser.installationKey);
        return RxAVPush.sendContent(data, {
            query: query,
            prod: prod
        });
    }
    /**
     * 发送
     *
     * @returns {Observable<boolean>}
     *
     * @memberOf RxAVPush
     */
    send() {
        let data = this.encode();
        return RxLeanCloud_1.RxAVClient.runCommand('/push', 'POST', data, RxLeanCloud_1.RxAVUser.currentSessionToken).map(body => {
            return true;
        });
    }
    encode() {
        if (!this.alert && !this.data)
            throw new Error('A push must have either an Alert or Data');
        if (!this.channels && !this.query)
            throw new Error('A push must have either Channels or a Query');
        let data = this.data ? this.data : { alert: this.alert };
        if (this.channels)
            this.query = this.query.containedIn("channels", this.channels);
        let payload = {
            data: data,
            where: this.query.buildParameters()['where']
        };
        if (this.prod) {
            payload['prod'] = this.prod;
        }
        if (this.expiration)
            payload["expiration_time"] = this.expiration;
        else if (!this.expirationInterval) {
            payload["expiration_interval"] = this.expirationInterval;
        }
        if (this.pushTime) {
            payload["push_time"] = this.pushTime;
        }
        return payload;
    }
}
exports.RxAVPush = RxAVPush;
