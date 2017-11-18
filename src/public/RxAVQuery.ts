import { RxAVClient, RxAVObject, RxAVUser, ICanSaved } from '../RxLeanCloud';
import { IQueryController } from '../internal/query/controller/IQueryController';
import { IObjectState } from '../internal/object/state/IObjectState';
import { SDKPlugins } from '../internal/SDKPlugins';
import { IAVEncoder } from '../internal/encoding/IAVEncoder';
import { Observer, Observable, Subject } from 'rxjs';
import { AVCommandResponse } from '../internal/command/AVCommandResponse';
import { RxAVRealtime, RxAVApp } from '../RxLeanCloud';
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

    constructor(objectClass: string | RxAVObject, options?: any) {
        if (typeof objectClass === 'string') {
            this.className = objectClass;
            this._app = RxAVClient.instance.take(options);
        } else if (objectClass instanceof RxAVObject) {
            this.className = objectClass.className;
            this._app = objectClass.state.app;
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
    protected _app: RxAVApp;
    get app() {
        return this._app;
    }
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
        return RxAVUser.currentSessionToken().flatMap(sessionToken => {
            return RxAVQuery._queryController.find(this, sessionToken).map(serverStates => {
                let resultList = serverStates.map((serverState, i, a) => {
                    return RxAVObject.instantiateSubclass(this.className, serverState);
                });
                if (resultList == undefined || resultList == null) {
                    resultList = [];
                }
                return resultList;
            });
        });
    }


    public seek(): Observable<RxAVObject> {
        return RxAVUser.currentSessionToken().flatMap(sessionToken => {
            return RxAVQuery._queryController.find(this, sessionToken).flatMap(serverStates => {
                let resultList = serverStates.map((serverState, i, a) => {
                    let rxObject = new RxAVObject(this.className);
                    rxObject.handleFetchResult(serverState);
                    return rxObject;
                });
                if (resultList == undefined || resultList == null) {
                    resultList = [];
                }
                return Observable.from(resultList);
            });
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
        let app: RxAVApp;
        queries.forEach((q) => {
            if (!className) {
                className = q.className;
                app = q.app;
            }

            if (className !== q.className) {
                throw new Error('All queries must be for the same class.');
            }
        });

        let query = new RxAVQuery(className, {
            app: app
        });
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
    public get selectedKeys() {
        return this._select;
    }
    get rxWebSocketController() {
        return this.realtime.RxWebSocketController;
    }
    protected createSubscription(query: RxAVQuery, sessionToken: string): Observable<RxAVLiveQuery> {
        let rtn: RxAVLiveQuery = null;
        return RxAVLiveQuery.getCurrent({ app: query.app }).flatMap(cacheLiveQuery => {
            let subscriptionId = '';
            let queryId = '';

            if (cacheLiveQuery != null) {
                subscriptionId = cacheLiveQuery.id;
                queryId = cacheLiveQuery.queryId;
            }

            let state = RxAVLiveQuery.getState({ app: query.app });
            if (state != null) {
                subscriptionId = state.id;
            }

            return RxAVClient.runCommand(`/LiveQuery/subscribe`, 'POST', {
                query: {
                    where: query.where,
                    className: query.className,
                    keys: query.selectedKeys,
                    queryId: queryId.length > 0 ? queryId : null
                },
                sessionToken: sessionToken,
                id: subscriptionId.length > 0 ? subscriptionId : null
            }, sessionToken, this.app).map(res => {
                queryId = res.query_id;

                rtn = RxAVLiveQuery.getMemory({ app: query.app, queryId: queryId });

                if (rtn == null) {
                    subscriptionId = subscriptionId.length > 0 ? subscriptionId : res.id;
                    rtn = new RxAVLiveQuery({ id: subscriptionId, queryId: queryId, query: query });
                    rtn.saveCurrent();
                }
                return rtn;
            });
        });
    }

    private _realtime: RxAVRealtime;
    public get realtime() {
        if (this._realtime == null) {
            this._realtime = new RxAVRealtime({ app: this.app });
        }
        return this._realtime;
    }

    subscribe(): Observable<RxAVLiveQuery> {
        let rtn: RxAVLiveQuery = null;
        return RxAVUser.currentSessionToken().flatMap(sessionToken => {
            return this.createSubscription(this, sessionToken).flatMap(liveQuerySubscription => {
                rtn = liveQuerySubscription;
                if (this.rxWebSocketController.websocketClient.readyState == 1) {
                    rtn.bind();
                    return Observable.from([rtn]);
                } else {
                    return this.realtime.open().flatMap(success => {
                        if (success) {
                            let liveQueryLogIn = new AVCommand();
                            liveQueryLogIn.data = {
                                cmd: 'login',
                                appId: this.realtime.app.appId,
                                installationId: liveQuerySubscription.id,
                                service: 1,
                                i: RxAVRealtime.getInstance({ app: this.app }).cmdId
                            };
                            return this.rxWebSocketController.execute(liveQueryLogIn);
                        }
                    }).map(logInResp => {
                        this.realtime.startHeartBeating();
                        rtn.bind();
                        return rtn;
                    });
                }
            });
        });
    }
}

import { AVCommand } from '../internal/command/AVCommand';
import { IRxWebSocketController } from '../internal/websocket/controller/IRxWebSocketController';
export class RxAVLiveQuery implements ICanSaved {

    constructor(options?: any) {
        if (options) {
            if (options.id) {
                this.id = options.id;
            }
            if (options.queryId) {
                this.queryId = options.queryId;
            }
            if (options.query) {
                this.query = options.query;
                this._websocketController = this.query.rxWebSocketController;
            }
        }
    }
    _websocketController: IRxWebSocketController;
    get rxWebSocketController() {
        return this._websocketController;
    }
    set rxWebSocketController(c: IRxWebSocketController) {
        this._websocketController = c;
    }
    static readonly LiveQuerySubscriptionCacheKey = 'LiveQuerySubscriptionCacheKey';
    private static _currentSubscriptions: Map<string, RxAVLiveQuery> = new Map<string, RxAVLiveQuery>();

    static getMemory(options?: any) {
        let rtn: RxAVLiveQuery = null;
        let app = RxAVClient.instance.take(options);
        let queryId = options.queryId;
        let key = `${app.appId}_${queryId}`;
        if (RxAVLiveQuery._currentSubscriptions.has(key) && queryId) {
            rtn = RxAVLiveQuery._currentSubscriptions.get(key);
        }
        return rtn;
    }

    static getState(options?: any) {
        let state: RxAVLiveQuery = null;
        let app = RxAVClient.instance.take(options);
        RxAVLiveQuery._currentSubscriptions.forEach((v, k, m) => {
            if (k.startsWith(app.appId)) {
                state = v;
            }
        });
        return state;
    }

    static getCurrent(options?: any): Observable<RxAVLiveQuery> {
        let rtn: RxAVLiveQuery = null;
        let app = RxAVClient.instance.take(options);
        if (SDKPlugins.instance.hasStorage) {
            return SDKPlugins.instance.LocalStorageControllerInstance.get(`${app.appId}_${RxAVLiveQuery.LiveQuerySubscriptionCacheKey}`).map(cache => {
                if (cache) {
                    rtn = new RxAVLiveQuery(cache);
                }
                return rtn;
            });
        }
        return Observable.from([rtn]);
    }
    saveCurrent() {
        let app = this.query.app;
        let key = `${app.appId}_${this.queryId}`;
        RxAVLiveQuery._currentSubscriptions.set(key, this);
        return RxAVObject.saveToLocalStorage(this as ICanSaved, `${app.appId}_${RxAVLiveQuery.LiveQuerySubscriptionCacheKey}`);
    }
    toJSONObjectForSaving(): {
        [key: string]: any;
    } {
        let data = {
            id: this.id,
            queryId: this.queryId
        };
        return data;
        // throw new Error("Method not implemented.");
    }

    bind() {
        this.on = this.rxWebSocketController.onMessage.filter(message => {
            let data = JSON.parse(message);
            if (Object.prototype.hasOwnProperty.call(data, 'cmd')) {
                let rtn = false;
                if (data.cmd == 'data') {
                    let ids = data.ids;
                    let msg: Array<{ object: any, op: string, query_id: string }> = data.msg;
                    msg.filter(item => {
                        return item.query_id == this.queryId;
                    }).forEach(item => {
                        rtn = true;
                    });
                    this.sendAck(ids);
                }
                return rtn;
            }
        }).flatMap(message => {
            let data = JSON.parse(message);
            console.log('livequery<=', data);
            let ids = data.ids;
            let msg: Array<{ object: any, op: string, updatedKeys: string[], query_id: string }> = data.msg;
            let obsArray: Array<{ scope: string, keys: string[], object: RxAVObject }> = [];
            msg.filter(item => {
                return item.query_id == this.queryId;
            }).forEach(item => {

                let objectJson = {};
                if (typeof item.object == 'string') {
                    objectJson = JSON.parse(item.object);
                } else if (typeof item.object == 'object') {
                    objectJson = item.object;
                }

                let objectState = SDKPlugins.instance.ObjectDecoder.decode(objectJson, SDKPlugins.instance.Decoder);
                let rxObject = new RxAVObject(this.query.className);
                rxObject.handleFetchResult(objectState);
                obsArray.push({ scope: item.op, keys: item.updatedKeys, object: rxObject });
            });
            return Observable.from(obsArray);
        });

    }

    // push(op: string, object: any) {
    //     let objectState = SDKPlugins.instance.ObjectDecoder.decode(object, SDKPlugins.instance.Decoder);
    //     let rxObject = new RxAVObject(this.query.className);
    //     rxObject.handleFetchResult(objectState);

    //     let notice = {
    //         scope: op,
    //         object: rxObject
    //     };
    //     this.on.next(notice);
    // }
    id: string;
    queryId: string;
    on: Observable<{ scope: string, keys: Array<string>, object: RxAVObject }>;
    query: RxAVQuery;

    sendAck(ids?: Array<string>) {
        let ackCmd = new AVCommand()
            .attribute('appId', this.query.app.appId)
            .attribute('cmd', 'ack')
            .attribute('installationId', this.id)
            .attribute('service', 1);

        if (ids) {
            ackCmd = ackCmd.attribute('ids', ids);
        }
        this.rxWebSocketController.execute(ackCmd);
    }
}

export class RxAVQueryIterator {

}