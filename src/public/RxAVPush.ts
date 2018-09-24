import { Observable, Subject } from 'rxjs';
import { RxParseClient, RxParseObject, RxParseQuery, RxParseUser, ParseApp, RxAVRealtime, RxAVInstallation } from 'RxParse';
import { AVCommand } from '../internal/command/AVCommand';
import { SDKPlugins } from '../internal/SDKPlugins';


/**
 *
 *
 * @export
 * @class RxParsePush
 */
export class RxParsePush {

    query: RxParseQuery;
    channels: Array<string>;
    expiration: Date;
    pushTime: Date;
    expirationInterval: number;
    data: { [key: string]: any };
    alert: string;
    prod: string;

    constructor() {
        this.query = new RxParseQuery('_Installation');
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
    public static sendContent(data: string | { [key: string]: any }, filter: {
        channels?: Array<string>,
        query?: RxParseQuery,
        prod?: string
    }) {
        let push = new RxParsePush();
        if (typeof data === 'string') {
            push.alert = data;
        } else {
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
     * @param {RxParseUser} user
     * @param {any} data:{(string | { [key: string]: any })}
     * @param {string} prod
     * @returns {Observable<boolean>} 返回是否成功刚发送
     * 
     * @memberOf RxAVPush
     */
    public static sendTo(user: RxParseUser | string, data: string | { [key: string]: any }, prod?: string) {
        let u: RxParseUser;
        if (user != undefined) {
            if (typeof user == 'string') {
                u = RxParseUser.createWithoutData(user);
            } else if (user instanceof RxParseUser) {
                u = user;
            }
        }
        let query = new RxParseQuery('_Installation');
        query.relatedTo(u, RxParseUser.installationKey);
        return RxParsePush.sendContent(data, {
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
    public send(): Observable<boolean> {
        let data = this.encode();
        return RxParseUser.currentSessionToken().flatMap(sessionToken => {
            return RxParseClient.runCommand('/push', 'POST', data, sessionToken, this.query.app).map(body => {
                return true;
            });
        });
    }

    protected encode() {
        if (!this.alert && !this.data) throw new Error('A push must have either an Alert or Data');
        if (!this.channels && !this.query) throw new Error('A push must have either Channels or a Query');
        let data = this.data ? this.data : { alert: this.alert };
        if (this.channels)
            this.query = this.query.containedIn("channels", this.channels);
        let payload: { [key: string]: any } = {
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

    public static getInstallation(deviceType: string) {
        return RxAVInstallation.current().flatMap(currentInstallation => {
            if (currentInstallation != undefined)
                return Observable.from([currentInstallation]);
            else {
                let installation = new RxAVInstallation();
                installation.deviceType = deviceType;
                installation.installationId = SDKPlugins.instance.ToolControllerInstance.newObjectId();
                return installation.save().map(created => {
                    return installation;
                });
            }
        });
    }

    public static realtime: RxAVRealtime;
    public static open(options?: any) {
        let deviceType = options && options.deviceType ? options.deviceType : 'web';
        RxParsePush.realtime = new RxAVRealtime();
        return RxParsePush.getInstallation(deviceType).flatMap(installation => {
            return RxParsePush.realtime.open().flatMap(opened => {
                if (opened) {
                    let sessionOpenCmd = new AVCommand();
                    sessionOpenCmd.data = {
                        cmd: 'login',
                        appId: RxParsePush.realtime.app.appId,
                        installationId: installation.installationId,
                        i: 9999999
                    };
                    return RxParsePush.realtime.RxWebSocketController.execute(sessionOpenCmd).map(response => {

                        return installation;
                    });
                }
                return Observable.from([installation]);
            });
        });
    }

    protected static _notification: Observable<any>;

    public static notification(): Observable<any> {
        if (RxParsePush._notification == undefined) {
            RxParsePush._notification = RxParsePush.realtime.RxWebSocketController.onMessage.filter(pushData => {
                let push = JSON.parse(pushData);
                if (Object.prototype.hasOwnProperty.call(push, 'cmd')) {
                    if (push.cmd == 'data') {
                        return true;
                    }
                }
                return false;
            });
        }
        return RxParsePush._notification;
    }
}