import { Observable, Subject, from } from 'rxjs';
import { ParseClient, RxParseObject, RxParseQuery, RxParseUser, ParseApp, RxParseInstallation } from '../RxParse';
import { ParseCommand } from '../internal/command/ParseCommand';
import { SDKPlugins } from '../internal/ParseClientPlugins';
import { flatMap, map } from 'rxjs/operators';

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
     *
     *
     * @static
     * @param {(string | { [key: string]: any })} data
     * @param {{
     *         channels?: Array<string>,
     *         query?: RxParseQuery,
     *         prod?: string
     *     }} filter
     * @returns
     * @memberof RxParsePush
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
     *
     *
     * @static
     * @param {(RxParseUser | string)} user
     * @param {(string | { [key: string]: any })} data
     * @param {string} [prod]
     * @returns
     * @memberof RxParsePush
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

    public send(): Observable<boolean> {
        let data = this.encode();
        return RxParseUser.currentSessionToken().pipe(flatMap(sessionToken => {
            return ParseClient.runCommand('/push', 'POST', data, sessionToken, this.query.app).pipe(map(body => {
                return true;
            }));
        }));
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
        return RxParseInstallation.current().pipe(flatMap(currentInstallation => {
            if (currentInstallation != undefined)
                return from([currentInstallation]);
            else {
                let installation = new RxParseInstallation();
                installation.deviceType = deviceType;
                installation.installationId = SDKPlugins.instance.ToolControllerInstance.newObjectId();
                return installation.save().pipe(map(created => {
                    return installation;
                }));
            }
        }));
    }
}