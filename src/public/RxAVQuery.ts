import { RxAVClient, RxAVObject, RxAVUser } from '../RxLeanCloud';
import { IQueryController } from '../internal/query/controller/IQueryController';
import { IObjectState } from '../internal/object/state/IObjectState';
import { SDKPlugins } from '../internal/SDKPlugins';
import { IAVEncoder } from '../internal/encoding/IAVEncoder';
import { Observable } from 'rxjs';

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

    find(): Observable<Array<RxAVObject>> {
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
}