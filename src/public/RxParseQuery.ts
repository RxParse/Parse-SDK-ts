import { ParseApp } from './ParseApp';
import { RxParseObject } from './RxParseObject';
import { ParseClientPlugins } from '../internal/ParseClientPlugins';
import { IParseEncoder } from '../internal/encoding/IParseEncoder';
import { IQueryController } from '../internal/query/controller/IQueryController';
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
        return ParseClientPlugins.instance.Encoder;
    }

    protected static get _queryController(): IQueryController {
        return ParseClientPlugins.instance.queryController;
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
        return RxParseQuery._queryController.find(this, null).pipe(map(serverStates => {
            let resultList = serverStates.map((serverState, i, a) => {
                return RxParseObject.instantiateSubclass(this.className, serverState);
            });
            if (resultList == undefined || resultList == null) {
                resultList = [];
            }
            return resultList;
        }));
    }


    public seek(): Observable<RxParseObject> {
        return RxParseQuery._queryController.find(this, null).pipe(flatMap(serverStates => {
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
}