import { RxAVObject } from '../RxLeanCloud';
import { IQueryController } from '../internal/query/controller/IQueryController';
import { IAVEncoder } from '../internal/encoding/IAVEncoder';
import { Observable, Subject } from 'rxjs';
/**
 * 针对 RxAVObject 的查询构建类
 *
 * @export
 * @class RxAVQuery
 */
export declare class RxAVQuery {
    constructor(objectClass: string | RxAVObject);
    className: string;
    protected _where: any;
    protected _include: Array<string>;
    protected _select: Array<string>;
    protected _limit: number;
    protected _skip: number;
    protected _order: Array<string>;
    protected _extraOptions: {
        [key: string]: any;
    };
    protected static readonly _encoder: IAVEncoder;
    protected static readonly _queryController: IQueryController;
    config(filter: Array<{
        key: string;
        constraint: string;
        value: any;
    }>, limit: number, skip: number, include: string[], select: string[]): RxAVQuery;
    equalTo(key: string, value: any): RxAVQuery;
    notEqualTo(key: string, value: any): RxAVQuery;
    lessThan(key: string, value: any): RxAVQuery;
    lessThanOrEqualTo(key: string, value: any): RxAVQuery;
    greaterThan(key: string, value: any): RxAVQuery;
    greaterThanOrEqualTo(key: string, value: any): RxAVQuery;
    containedIn(key: string, value: any): RxAVQuery;
    notContainedIn(key: string, value: any): RxAVQuery;
    containsAll(key: string, values: Array<any>): RxAVQuery;
    exists(key: string): RxAVQuery;
    doesNotExist(key: string): RxAVQuery;
    contains(key: string, value: string): RxAVQuery;
    startsWith(key: string, value: string): RxAVQuery;
    endsWith(key: string, value: string): RxAVQuery;
    protected quote(s: string): string;
    relatedTo(parent: RxAVObject, key: string): RxAVQuery;
    ascending(...keys: Array<string>): RxAVQuery;
    addAscending(...keys: Array<string>): RxAVQuery;
    descending(...keys: Array<string>): RxAVQuery;
    addDescending(...keys: Array<string>): RxAVQuery;
    skip(n: number): RxAVQuery;
    limit(n: number): RxAVQuery;
    include(...keys: Array<string>): RxAVQuery;
    select(...keys: Array<string>): RxAVQuery;
    /**
     * 执行查询
     *
     * @returns {Observable<Array<RxAVObject>>}
     *
     * @memberOf RxAVQuery
     */
    find(): Observable<Array<RxAVObject>>;
    /**
     *
     *
     * @static
     * @param {...Array<RxAVQuery>} queries
     * @returns {RxAVQuery}
     *
     * @memberOf RxAVQuery
     */
    static or(...queries: Array<RxAVQuery>): RxAVQuery;
    protected _orQuery(queries: Array<RxAVQuery>): RxAVQuery;
    protected _addCondition(key: string, condition: string, value: any): RxAVQuery;
    protected _encode(value: any, disallowObjects: boolean, forcePointers: boolean): any;
    buildParameters(includeClassName?: boolean): {
        [key: string]: any;
    };
    readonly where: any;
    readonly RxWebSocketController: IRxWebSocketController;
    protected createSubscription(query: RxAVQuery, sessionToken: string): Observable<RxAVLiveQuery>;
    subscribe(): Observable<RxAVLiveQuery>;
}
import { IRxWebSocketController } from '../internal/websocket/controller/IRxWebSocketController';
export declare class RxAVLiveQuery {
    constructor(id?: string);
    readonly RxWebSocketController: IRxWebSocketController;
    push(op: string, object: any): void;
    id: string;
    queryId: string;
    on: Subject<{
        scope: string;
        object: RxAVObject;
    }>;
    query: RxAVQuery;
    sendAck(ids?: Array<string>): void;
}
