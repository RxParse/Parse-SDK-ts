"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const RxLeanCloud_1 = require("../RxLeanCloud");
const SDKPlugins_1 = require("../internal/SDKPlugins");
const rxjs_1 = require("rxjs");
const RxLeanCloud_2 = require("../RxLeanCloud");
/**
 * 针对 RxAVObject 的查询构建类
 *
 * @export
 * @class RxAVQuery
 */
class RxAVQuery {
    constructor(objectClass, options) {
        if (typeof objectClass === 'string') {
            this.className = objectClass;
            this._app = RxLeanCloud_1.RxAVClient.instance.take(this._app, options);
        }
        else if (objectClass instanceof RxLeanCloud_1.RxAVObject) {
            this.className = objectClass.className;
            this._app = objectClass.state.app;
        }
        else {
            throw new Error('A RxAVQuery must be constructed with a RxAVObject or class name.');
        }
        console.log('RxAVQuery', this.app);
        this._where = {};
        this._include = [];
        this._limit = -1; // negative limit is not sent in the server request
        this._skip = 0;
        this._extraOptions = {};
    }
    get app() {
        return this._app;
    }
    static get _encoder() {
        return SDKPlugins_1.SDKPlugins.instance.Encoder;
    }
    static get _queryController() {
        return SDKPlugins_1.SDKPlugins.instance.QueryControllerInstance;
    }
    config(filter, limit, skip, include, select) {
        return new RxAVQuery(this.className);
    }
    equalTo(key, value) {
        this._where[key] = this._encode(value, false, true);
        return this;
    }
    notEqualTo(key, value) {
        return this._addCondition(key, '$ne', value);
    }
    lessThan(key, value) {
        return this._addCondition(key, '$lt', value);
    }
    lessThanOrEqualTo(key, value) {
        return this._addCondition(key, '$lte', value);
    }
    greaterThan(key, value) {
        return this._addCondition(key, '$gt', value);
    }
    greaterThanOrEqualTo(key, value) {
        return this._addCondition(key, '$gte', value);
    }
    containedIn(key, value) {
        return this._addCondition(key, '$in', value);
    }
    notContainedIn(key, value) {
        return this._addCondition(key, '$nin', value);
    }
    containsAll(key, values) {
        return this._addCondition(key, '$all', values);
    }
    exists(key) {
        return this._addCondition(key, '$exists', true);
    }
    doesNotExist(key) {
        return this._addCondition(key, '$exists', false);
    }
    contains(key, value) {
        if (typeof value !== 'string') {
            throw new Error('The value being searched for must be a string.');
        }
        return this._addCondition(key, '$regex', this.quote(value));
    }
    startsWith(key, value) {
        if (typeof value !== 'string') {
            throw new Error('The value being searched for must be a string.');
        }
        return this._addCondition(key, '$regex', '^' + this.quote(value));
    }
    endsWith(key, value) {
        if (typeof value !== 'string') {
            throw new Error('The value being searched for must be a string.');
        }
        return this._addCondition(key, '$regex', this.quote(value) + '$');
    }
    quote(s) {
        return '\\Q' + s.replace('\\E', '\\E\\\\E\\Q') + '\\E';
    }
    relatedTo(parent, key) {
        this._addCondition('$relatedTo', 'object', {
            __type: 'Pointer',
            className: parent.className,
            objectId: parent.objectId
        });
        return this._addCondition('$relatedTo', 'key', key);
    }
    ascending(...keys) {
        this._order = [];
        return this.addAscending.apply(this, keys);
    }
    addAscending(...keys) {
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
    descending(...keys) {
        this._order = [];
        return this.addDescending.apply(this, keys);
    }
    addDescending(...keys) {
        if (!this._order) {
            this._order = [];
        }
        keys.forEach((key) => {
            if (Array.isArray(key)) {
                key = key.join();
            }
            this._order = this._order.concat(key.replace(/\s/g, '').split(',').map((k) => {
                return '-' + k;
            }));
        });
        return this;
    }
    skip(n) {
        if (typeof n !== 'number' || n < 0) {
            throw new Error('You can only skip by a positive number');
        }
        this._skip = n;
        return this;
    }
    limit(n) {
        if (typeof n !== 'number') {
            throw new Error('You can only set the limit to a numeric value');
        }
        this._limit = n;
        return this;
    }
    include(...keys) {
        keys.forEach((key) => {
            if (Array.isArray(key)) {
                this._include = this._include.concat(key);
            }
            else {
                this._include.push(key);
            }
        });
        return this;
    }
    select(...keys) {
        if (!this._select) {
            this._select = [];
        }
        keys.forEach((key) => {
            if (Array.isArray(key)) {
                this._select = this._select.concat(key);
            }
            else {
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
    find() {
        return RxAVQuery._queryController.find(this, RxLeanCloud_1.RxAVUser.currentSessionToken).map(serverStates => {
            let resultList = serverStates.map((serverState, i, a) => {
                let rxObject = new RxLeanCloud_1.RxAVObject(this.className);
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
    static or(...queries) {
        let className = null;
        let app;
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
    _orQuery(queries) {
        let queryJSON = queries.map((q) => {
            return q._where;
        });
        this._where.$or = queryJSON;
        return this;
    }
    _addCondition(key, condition, value) {
        if (!this._where[key] || typeof this._where[key] === 'string') {
            this._where[key] = {};
        }
        this._where[key][condition] = this._encode(value, false, true);
        return this;
    }
    _encode(value, disallowObjects, forcePointers) {
        return RxAVQuery._encoder.encodeItem(value);
    }
    buildParameters(includeClassName = false) {
        let result = {};
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
    get where() {
        return this._where;
    }
    get RxWebSocketController() {
        return SDKPlugins_1.SDKPlugins.instance.WebSocketController;
    }
    createSubscription(query, sessionToken) {
        return RxLeanCloud_1.RxAVClient.runCommand(`/LiveQuery/subscribe`, 'POST', {
            query: {
                where: query.where,
                className: query.className
            }
        }, sessionToken, this.app).map(res => {
            let subscriptionId = res.id;
            let queryId = res.query_id;
            let rtn = new RxAVLiveQuery(subscriptionId);
            rtn.queryId = queryId;
            rtn.query = query;
            return rtn;
        });
    }
    get realtime() {
        if (this._realtime == null) {
            this._realtime = new RxLeanCloud_2.RxAVRealtime({ app: this.app });
        }
        return this._realtime;
    }
    subscribe() {
        let rtn;
        return this.createSubscription(this, RxLeanCloud_1.RxAVUser.currentSessionToken).flatMap(liveQuerySubscription => {
            rtn = liveQuerySubscription;
            return this.realtime.open();
        }).flatMap(success => {
            // console.log('success', success);
            // console.log('this.RxWebSocketController.onState', this.RxWebSocketController.onState);
            // this.RxWebSocketController.onState.subscribe(state => {
            //     console.log(state);
            // });
            let liveQueryLogIn = new AVCommand_1.AVCommand();
            liveQueryLogIn.data = {
                cmd: 'login',
                op: 'open',
                appId: this.realtime.app.appId,
                installationId: rtn.id,
                service: 1,
                i: RxLeanCloud_2.RxAVRealtime.instance.cmdId
            };
            return this.RxWebSocketController.execute(liveQueryLogIn);
        }).map(logInResp => {
            this.RxWebSocketController.onMessage.subscribe(message => {
                let data = JSON.parse(message);
                console.log('livequery<=', data);
                if (Object.prototype.hasOwnProperty.call(data, 'cmd')) {
                    if (data.cmd == 'data') {
                        let ids = data.ids;
                        let msg = data.msg;
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
exports.RxAVQuery = RxAVQuery;
const AVCommand_1 = require("../internal/command/AVCommand");
class RxAVLiveQuery {
    constructor(id, options) {
        this.id = id;
        this.on = new rxjs_1.Subject();
    }
    get RxWebSocketController() {
        return SDKPlugins_1.SDKPlugins.instance.WebSocketController;
    }
    push(op, object) {
        let objectState = SDKPlugins_1.SDKPlugins.instance.ObjectDecoder.decode(object, SDKPlugins_1.SDKPlugins.instance.Decoder);
        let rxObject = new RxLeanCloud_1.RxAVObject(this.query.className);
        rxObject.handleFetchResult(objectState);
        let notice = {
            scope: op,
            object: rxObject
        };
        this.on.next(notice);
    }
    sendAck(ids) {
        let ackCmd = new AVCommand_1.AVCommand()
            .attribute('appId', this.query.app.appId)
            .attribute('cmd', 'ack')
            .attribute('installationId', this.id)
            .attribute('service', 1);
        if (ids) {
            ackCmd = ackCmd.attribute('ids', ids);
        }
        this.RxWebSocketController.execute(ackCmd);
    }
}
exports.RxAVLiveQuery = RxAVLiveQuery;
