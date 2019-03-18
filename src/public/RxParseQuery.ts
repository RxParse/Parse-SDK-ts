import { ParseClient, RxParseObject, RxParseUser, ICanSaved, ParseApp } from '../RxParse';
import { SDKPlugins } from '../internal/ParseClientPlugins';
import { IParseEncoder } from '../internal/encoding/IParseEncoder';
import { IQueryController } from '../internal/query/controller/IQueryController';
import { ParseCommand } from '../internal/command/ParseCommand';
import { IRxWebSocketController } from '../internal/websocket/controller/IRxWebSocketController';
import { flatMap, map, filter } from 'rxjs/operators';
import { Observable, from } from 'rxjs';
/**
 *
 *
 * @export
 * @class RxParseQuery
 */
export class RxParseQuery {

    constructor(objectClass: string | RxParseObject, options?: any) {
        if (typeof objectClass === 'string') {
            this.className = objectClass;
            this._app = ParseClient.instance.take(options);
        } else if (objectClass instanceof RxParseObject) {
            this.className = objectClass.className;
            this._app = objectClass.state.app;
        }
        else {
            throw new Error('A RxParseQuery must be constructed with a RxParseObject or class name.');
        }
        this._where = {};
        this._include = [];
        this._limit = -1; // negative limit is not sent in the server request
        this._skip = 0;
        this._extraOptions = {};
    }

    className: string;
    protected _app: ParseApp;
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

    protected static get _encoder(): IParseEncoder {
        return SDKPlugins.instance.Encoder;
    }

    protected static get _queryController(): IQueryController {
        return SDKPlugins.instance.queryController;
    }

    config(filter: Array<{
        key: string,
        constraint: string,
        value: any
    }>, limit: number, skip: number, include: string[], select: string[]): RxParseQuery {
        return new RxParseQuery(this.className);
    }

    equalTo(key: string, value: any): RxParseQuery {
        this._where[key] = this._encode(value, false, true);
        return this;
    }

    notEqualTo(key: string, value: any): RxParseQuery {
        return this._addCondition(key, '$ne', value);
    }

    lessThan(key: string, value: any): RxParseQuery {
        return this._addCondition(key, '$lt', value);
    }

    lessThanOrEqualTo(key: string, value: any): RxParseQuery {
        return this._addCondition(key, '$lte', value);
    }

    greaterThan(key: string, value: any): RxParseQuery {
        return this._addCondition(key, '$gt', value);
    }

    greaterThanOrEqualTo(key: string, value: any): RxParseQuery {
        return this._addCondition(key, '$gte', value);
    }

    containedIn(key: string, value: any): RxParseQuery {
        return this._addCondition(key, '$in', value);
    }

    notContainedIn(key: string, value: any): RxParseQuery {
        return this._addCondition(key, '$nin', value);
    }

    containsAll(key: string, values: Array<any>): RxParseQuery {
        return this._addCondition(key, '$all', values);
    }

    exists(key: string): RxParseQuery {
        return this._addCondition(key, '$exists', true);
    }

    doesNotExist(key: string): RxParseQuery {
        return this._addCondition(key, '$exists', false);
    }

    contains(key: string, value: string): RxParseQuery {
        if (typeof value !== 'string') {
            throw new Error('The value being searched for must be a string.');
        }
        return this._addCondition(key, '$regex', this.quote(value));
    }

    startsWith(key: string, value: string): RxParseQuery {
        if (typeof value !== 'string') {
            throw new Error('The value being searched for must be a string.');
        }
        return this._addCondition(key, '$regex', '^' + this.quote(value));
    }

    endsWith(key: string, value: string): RxParseQuery {
        if (typeof value !== 'string') {
            throw new Error('The value being searched for must be a string.');
        }
        return this._addCondition(key, '$regex', this.quote(value) + '$');
    }

    protected quote(s: string) {
        return '\\Q' + s.replace('\\E', '\\E\\\\E\\Q') + '\\E';
    }

    relatedTo(parent: RxParseObject, key: string) {
        this._addCondition('$relatedTo', 'object', {
            __type: 'Pointer',
            className: parent.className,
            objectId: parent.objectId
        });
        return this._addCondition('$relatedTo', 'key', key);
    }

    ascending(...keys: Array<string>): RxParseQuery {
        this._order = [];
        return this.addAscending.apply(this, keys);
    }

    addAscending(...keys: Array<string>): RxParseQuery {
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

    descending(...keys: Array<string>): RxParseQuery {
        this._order = [];
        return this.addDescending.apply(this, keys);
    }

    addDescending(...keys: Array<string>): RxParseQuery {
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

    skip(n: number): RxParseQuery {
        if (typeof n !== 'number' || n < 0) {
            throw new Error('You can only skip by a positive number');
        }
        this._skip = n;
        return this;
    }

    limit(n: number): RxParseQuery {
        if (typeof n !== 'number') {
            throw new Error('You can only set the limit to a numeric value');
        }
        this._limit = n;
        return this;
    }

    include(...keys: Array<string>): RxParseQuery {
        keys.forEach((key) => {
            if (Array.isArray(key)) {
                this._include = this._include.concat(key);
            } else {
                this._include.push(key);
            }
        });
        return this;
    }

    select(...keys: Array<string>): RxParseQuery {
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

    public find(): Observable<Array<RxParseObject>> {
        return RxParseUser.currentSessionToken().pipe(flatMap(sessionToken => {
            return RxParseQuery._queryController.find(this, sessionToken).pipe(map(serverStates => {
                let resultList = serverStates.map((serverState, i, a) => {
                    return RxParseObject.instantiateSubclass(this.className, serverState);
                });
                if (resultList == undefined || resultList == null) {
                    resultList = [];
                }
                return resultList;
            }));
        }));
    }


    public seek(): Observable<RxParseObject> {
        return RxParseUser.currentSessionToken().pipe(flatMap(sessionToken => {
            return RxParseQuery._queryController.find(this, sessionToken).pipe(flatMap(serverStates => {
                let resultList = serverStates.map((serverState, i, a) => {
                    let rxObject = new RxParseObject(this.className);
                    rxObject.handleFetchResult(serverState);
                    return rxObject;
                });
                if (resultList == undefined || resultList == null) {
                    resultList = [];
                }
                return from(resultList);
            }));
        }));
    }

    public static or(...queries: Array<RxParseQuery>): RxParseQuery {
        let className = null;
        let app: ParseApp;
        queries.forEach((q) => {
            if (!className) {
                className = q.className;
                app = q.app;
            }

            if (className !== q.className) {
                throw new Error('All queries must be for the same class.');
            }
        });

        let query = new RxParseQuery(className, {
            app: app
        });
        query._orQuery(queries);
        return query;
    }

    protected _orQuery(queries: Array<RxParseQuery>): RxParseQuery {
        let queryJSON = queries.map((q) => {
            return q._where;
        });

        this._where.$or = queryJSON;

        return this;
    }

    protected _addCondition(key: string, condition: string, value: any): RxParseQuery {
        if (!this._where[key] || typeof this._where[key] === 'string') {
            this._where[key] = {};
        }
        this._where[key][condition] = this._encode(value, false, true);
        return this;
    }

    protected _encode(value: any, disallowObjects: boolean, forcePointers: boolean) {
        return RxParseQuery._encoder.encode(value);
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
    protected createSubscription(query: RxParseQuery, sessionToken: string): Observable<RxParseLiveQuery> {
        let rtn: RxParseLiveQuery = null;
        return RxParseLiveQuery.getCurrent({ app: query.app }).pipe(flatMap(cacheLiveQuery => {
            let subscriptionId = '';
            let queryId = '';

            if (cacheLiveQuery != null) {
                subscriptionId = cacheLiveQuery.id;
                queryId = cacheLiveQuery.queryId;
            }

            let state = RxParseLiveQuery.getState({ app: query.app });
            if (state != null) {
                subscriptionId = state.id;
            }

            return ParseClient.runCommand(`/LiveQuery/subscribe`, 'POST', {
                query: {
                    where: query.where,
                    className: query.className,
                    keys: query.selectedKeys,
                    queryId: queryId.length > 0 ? queryId : null
                },
                sessionToken: sessionToken,
                id: subscriptionId.length > 0 ? subscriptionId : null
            }, sessionToken, this.app).pipe(map(res => {
                queryId = res.query_id;

                rtn = RxParseLiveQuery.getMemory({ app: query.app, queryId: queryId });

                if (rtn == null) {
                    subscriptionId = subscriptionId.length > 0 ? subscriptionId : res.id;
                    rtn = new RxParseLiveQuery({ id: subscriptionId, queryId: queryId, query: query });
                    rtn.saveCurrent();
                }
                return rtn;
            }));
        }));
    }
}

export class RxParseLiveQuery implements ICanSaved {

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
    private static _currentSubscriptions: Map<string, RxParseLiveQuery> = new Map<string, RxParseLiveQuery>();

    static getMemory(options?: any) {
        let rtn: RxParseLiveQuery = null;
        let app = ParseClient.instance.take(options);
        let queryId = options.queryId;
        let key = `${app.appId}_${queryId}`;
        if (RxParseLiveQuery._currentSubscriptions.has(key) && queryId) {
            rtn = RxParseLiveQuery._currentSubscriptions.get(key);
        }
        return rtn;
    }

    static getState(options?: any) {
        let state: RxParseLiveQuery = null;
        let app = ParseClient.instance.take(options);
        RxParseLiveQuery._currentSubscriptions.forEach((v, k, m) => {
            if (k.startsWith(app.appId)) {
                state = v;
            }
        });
        return state;
    }

    static getCurrent(options?: any): Observable<RxParseLiveQuery> {
        let rtn: RxParseLiveQuery = null;
        let app = ParseClient.instance.take(options);
        if (SDKPlugins.instance.hasStorage) {
            return SDKPlugins.instance.LocalStorageControllerInstance.get(`${app.appId}_${RxParseLiveQuery.LiveQuerySubscriptionCacheKey}`).pipe(map(cache => {
                if (cache) {
                    rtn = new RxParseLiveQuery(cache);
                }
                return rtn;
            }));
        }
        return from([rtn]);
    }
    saveCurrent() {
        let app = this.query.app;
        let key = `${app.appId}_${this.queryId}`;
        RxParseLiveQuery._currentSubscriptions.set(key, this);
        return RxParseObject.saveToLocalStorage(this as ICanSaved, `${app.appId}_${RxParseLiveQuery.LiveQuerySubscriptionCacheKey}`);
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
        this.on = this.rxWebSocketController.onMessage.pipe(filter(message => {
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
        }), flatMap(message => {
            let data = JSON.parse(message);
            console.log('liveQuery<=', data);
            let ids = data.ids;
            let msg: Array<{ object: any, op: string, updatedKeys: string[], query_id: string }> = data.msg;
            let obsArray: Array<{ scope: string, keys: string[], object: RxParseObject }> = [];
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
                let rxObject = new RxParseObject(this.query.className);
                rxObject.handleFetchResult(objectState);
                obsArray.push({ scope: item.op, keys: item.updatedKeys, object: rxObject });
            });
            return from(obsArray);
        }));

    }

    id: string;
    queryId: string;
    on: Observable<{ scope: string, keys: Array<string>, object: RxParseObject }>;
    query: RxParseQuery;

    sendAck(ids?: Array<string>) {
        let ackCmd = new ParseCommand()
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

export class RxParseQueryIterator {

}