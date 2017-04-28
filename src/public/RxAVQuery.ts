import { RxAVClient, RxAVObject, RxAVUser } from '../RxLeanCloud';
import { IQueryController } from '../internal/query/controller/IQueryController';
import { IObjectState } from '../internal/object/state/IObjectState';
import { SDKPlugins } from '../internal/SDKPlugins';
import { IAVEncoder } from '../internal/encoding/IAVEncoder';
import { Observable, Subject } from 'rxjs';
import { RxAVRealtime } from '../RxLeanCloud';
/**
 * 针对 RxAVObject 的查询构建类
 * 
 * @export
 * @class RxAVQuery
 */
export /**
 * RxAVQuery
 */
    class RxAVQuery {

    constructor(objectClass: string | RxAVObject) {
        if (typeof objectClass === 'string') {
            this.className = objectClass;
        } else if (objectClass instanceof RxAVObject) {
            this.className = objectClass.className;
        }
        else {
            throw new Error('A RxAVQuery must be constructed with a RxAVObject or class name.');
        }
        this._where = {};
        this._include = [];
        this._limit = -1; // negative limit is not sent in the server request
        this._skip = 0;
        this._extraOptions = {};
    }

    className: string;
    protected _where: any;
    protected _include: Array<string>;
    protected _select: Array<string>;
    protected _limit: number;
    protected _skip: number;
    protected _order: Array<string>;
    protected _extraOptions: { [key: string]: any };

    protected static get _encoder() {
        return SDKPlugins.instance.Encoder;
    }

    protected static get _queryController() {
        return SDKPlugins.instance.QueryControllerInstance;
    }

    config(filter: Array<{
        key: string,
        constraint: string,
        value: any
    }>, limit: number, skip: number, include: string[], select: string[]): RxAVQuery {
        return new RxAVQuery(this.className);
    }

    equalTo(key: string, value: any): RxAVQuery {
        this._where[key] = this._encode(value, false, true);
        return this;
    }

    notEqualTo(key: string, value: any): RxAVQuery {
        return this._addCondition(key, '$ne', value);
    }

    lessThan(key: string, value: any): RxAVQuery {
        return this._addCondition(key, '$lt', value);
    }

    lessThanOrEqualTo(key: string, value: any): RxAVQuery {
        return this._addCondition(key, '$lte', value);
    }

    greaterThan(key: string, value: any): RxAVQuery {
        return this._addCondition(key, '$gt', value);
    }

    greaterThanOrEqualTo(key: string, value: any): RxAVQuery {
        return this._addCondition(key, '$gte', value);
    }

    containedIn(key: string, value: any): RxAVQuery {
        return this._addCondition(key, '$in', value);
    }

    notContainedIn(key: string, value: any): RxAVQuery {
        return this._addCondition(key, '$nin', value);
    }

    containsAll(key: string, values: Array<any>): RxAVQuery {
        return this._addCondition(key, '$all', values);
    }

    exists(key: string): RxAVQuery {
        return this._addCondition(key, '$exists', true);
    }

    doesNotExist(key: string): RxAVQuery {
        return this._addCondition(key, '$exists', false);
    }

    contains(key: string, value: string): RxAVQuery {
        if (typeof value !== 'string') {
            throw new Error('The value being searched for must be a string.');
        }
        return this._addCondition(key, '$regex', this.quote(value));
    }

    startsWith(key: string, value: string): RxAVQuery {
        if (typeof value !== 'string') {
            throw new Error('The value being searched for must be a string.');
        }
        return this._addCondition(key, '$regex', '^' + this.quote(value));
    }

    endsWith(key: string, value: string): RxAVQuery {
        if (typeof value !== 'string') {
            throw new Error('The value being searched for must be a string.');
        }
        return this._addCondition(key, '$regex', this.quote(value) + '$');
    }

    protected quote(s: string) {
        return '\\Q' + s.replace('\\E', '\\E\\\\E\\Q') + '\\E';
    }

    relatedTo(parent: RxAVObject, key: string) {
        this._addCondition('$relatedTo', 'object', {
            __type: 'Pointer',
            className: parent.className,
            objectId: parent.objectId
        });
        return this._addCondition('$relatedTo', 'key', key);
    }

    ascending(...keys: Array<string>): RxAVQuery {
        this._order = [];
        return this.addAscending.apply(this, keys);
    }

    addAscending(...keys: Array<string>): RxAVQuery {
        if (!this._order) {
            this._order = [];
        }
        keys.forEach((key) => {
            if (Array.isArray(key)) {
                key = key.join();
            }
            this._order = this._order.concat(key.replace(/\s/g, '').split(','));
        });

        return this;
    }

    descending(...keys: Array<string>): RxAVQuery {
        this._order = [];
        return this.addDescending.apply(this, keys);
    }

    addDescending(...keys: Array<string>): RxAVQuery {
        if (!this._order) {
            this._order = [];
        }
        keys.forEach((key) => {
            if (Array.isArray(key)) {
                key = key.join();
            }
            this._order = this._order.concat(
                key.replace(/\s/g, '').split(',').map((k) => {
                    return '-' + k;
                })
            );
        });

        return this;
    }

    skip(n: number): RxAVQuery {
        if (typeof n !== 'number' || n < 0) {
            throw new Error('You can only skip by a positive number');
        }
        this._skip = n;
        return this;
    }

    limit(n: number): RxAVQuery {
        if (typeof n !== 'number') {
            throw new Error('You can only set the limit to a numeric value');
        }
        this._limit = n;
        return this;
    }

    include(...keys: Array<string>): RxAVQuery {
        keys.forEach((key) => {
            if (Array.isArray(key)) {
                this._include = this._include.concat(key);
            } else {
                this._include.push(key);
            }
        });
        return this;
    }

    select(...keys: Array<string>): RxAVQuery {
        if (!this._select) {
            this._select = [];
        }
        keys.forEach((key) => {
            if (Array.isArray(key)) {
                this._select = this._select.concat(key);
            } else {
                this._select.push(key);
            }
        });
        return this;
    }

    /**
     * 执行查询
     * 
     * @returns {Observable<Array<RxAVObject>>}
     * 
     * @memberOf RxAVQuery
     */
    public find(): Observable<Array<RxAVObject>> {
        return RxAVQuery._queryController.find(this, RxAVUser.currentSessionToken).map(serverStates => {
            let resultList = serverStates.map((serverState, i, a) => {
                let rxObject = new RxAVObject(this.className);
                rxObject.handleFetchResult(serverState);
                return rxObject;
            });
            if (resultList == undefined || resultList == null) {
                resultList = [];
            }
            return resultList;
        });
    }

    /**
     * 
     * 
     * @static
     * @param {...Array<RxAVQuery>} queries
     * @returns {RxAVQuery}
     * 
     * @memberOf RxAVQuery
     */
    public static or(...queries: Array<RxAVQuery>): RxAVQuery {
        let className = null;
        queries.forEach((q) => {
            if (!className) {
                className = q.className;
            }

            if (className !== q.className) {
                throw new Error('All queries must be for the same class.');
            }
        });

        let query = new RxAVQuery(className);
        query._orQuery(queries);
        return query;
    }

    protected _orQuery(queries: Array<RxAVQuery>): RxAVQuery {
        let queryJSON = queries.map((q) => {
            return q._where;
        });

        this._where.$or = queryJSON;
        return this;
    }

    protected _addCondition(key: string, condition: string, value: any): RxAVQuery {
        if (!this._where[key] || typeof this._where[key] === 'string') {
            this._where[key] = {};
        }
        this._where[key][condition] = this._encode(value, false, true);
        return this;
    }

    protected _encode(value: any, disallowObjects: boolean, forcePointers: boolean) {
        return RxAVQuery._encoder.encodeItem(value);
    }


    buildParameters(includeClassName: boolean = false) {
        let result: { [key: string]: any } = {};
        if (Object.keys(this._where).length > 0) {
            result['where'] = JSON.stringify(this._where);
        }
        if (this._order) {
            result["order"] = this._order.join(",");
        }
        if (this._limit > 0) {
            result["limit"] = this._limit;
        }
        if (this._skip > 0) {
            result["skip"] = this._skip;
        }
        if (this._include.length) {
            result['include'] = this._include.join(',');
        }
        if (this._select) {
            result['keys'] = this._select.join(',');
        }
        return result;
    }
    public get where() {
        return this._where;
    }
    get RxWebSocketController() {
        return SDKPlugins.instance.WebSocketController;
    }
    protected createSubscription(query: RxAVQuery, sessionToken: string): Observable<RxAVLiveQuery> {
        return RxAVClient.runCommand(`/LiveQuery/subscribe`, 'POST', {
            query: {
                where: query.where,
                className: query.className
            }
        }, sessionToken).map(res => {
            let subscriptionId = res.id;
            let queryId = res.query_id;

            let rtn = new RxAVLiveQuery(subscriptionId);
            rtn.queryId = queryId;
            rtn.query = query;
            return rtn;
        });
    }
    subscribe(): Observable<RxAVLiveQuery> {
        let rtn: RxAVLiveQuery;
        return this.createSubscription(this, RxAVUser.currentSessionToken).flatMap(liveQuerySubscription => {
            rtn = liveQuerySubscription;
            return RxAVRealtime.instance.open();
        }).flatMap(success => {
            this.RxWebSocketController.rxWebSocketClient.onState.subscribe(state => {
                console.log(state);
            });
            let liveQueryLogIn = new AVCommand();
            liveQueryLogIn.data = {
                cmd: 'login',
                op: 'open',
                appId: RxAVClient.instance.currentConfiguration.applicationId,
                installationId: rtn.id,
                service: 1,
                i: RxAVRealtime.instance.cmdId
            };
            return this.RxWebSocketController.execute(liveQueryLogIn);
        }).map(logInResp => {
            this.RxWebSocketController.rxWebSocketClient.onMessage.subscribe(data => {
                console.log('livequery<=', data);
                if (Object.prototype.hasOwnProperty.call(data, 'cmd')) {
                    if (data.cmd == 'data') {
                        let ids = data.ids;
                        let msg: Array<{ object: any, op: string, query_id: string }> = data.msg;
                        msg.filter(item => {
                            return item.query_id == rtn.queryId;
                        }).forEach(item => {
                            rtn.push(item.op, item.object);
                        });
                        rtn.sendAck(ids);
                    }
                }
            });
            return rtn;
        });
    }
}

import { AVCommand } from '../internal/command/AVCommand';
import { IRxWebSocketController } from '../internal/websocket/controller/IRxWebSocketController';
export class RxAVLiveQuery {

    constructor(id?: string) {
        this.id = id;
        this.on = new Subject<{ scope: string, object: RxAVObject }>();
    }
    get RxWebSocketController() {
        return SDKPlugins.instance.WebSocketController;
    }
    push(op: string, object: any) {
        let objectState = SDKPlugins.instance.ObjectDecoder.decode(object, SDKPlugins.instance.Decoder);
        let rxObject = new RxAVObject(this.query.className);
        rxObject.handleFetchResult(objectState);

        let notice = {
            scope: op,
            object: rxObject
        };
        console.log('notice', notice);
        this.on.next(notice);
    }
    id: string;
    queryId: string;
    on: Subject<{ scope: string, object: RxAVObject }>;
    query: RxAVQuery;

    sendAck(ids?: Array<string>) {
        let ackCmd = new AVCommand()
            .attribute('appId', RxAVClient.instance.currentConfiguration.applicationId)
            .attribute('cmd', 'ack')
            .attribute('installationId', this.id)
            .attribute('service', 1);

        if (ids) {
            ackCmd = ackCmd.attribute('ids', ids);
        }
        this.RxWebSocketController.execute(ackCmd);
    }
}