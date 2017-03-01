"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var RxLeanCloud_1 = require("../RxLeanCloud");
var SDKPlugins_1 = require("../internal/SDKPlugins");
/**
 * 针对 RxAVObject 的查询构建类
 *
 * @export
 * @class RxAVQuery
 */
var RxAVQuery = (function () {
    function RxAVQuery(objectClass) {
        if (typeof objectClass === 'string') {
            this.className = objectClass;
        }
        else if (objectClass instanceof RxLeanCloud_1.RxAVObject) {
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
    Object.defineProperty(RxAVQuery, "_encoder", {
        get: function () {
            return SDKPlugins_1.SDKPlugins.instance.Encoder;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(RxAVQuery, "_queryController", {
        get: function () {
            return SDKPlugins_1.SDKPlugins.instance.QueryControllerInstance;
        },
        enumerable: true,
        configurable: true
    });
    RxAVQuery.prototype.config = function (filter, limit, skip, include, select) {
        return new RxAVQuery(this.className);
    };
    RxAVQuery.prototype.equalTo = function (key, value) {
        this._where[key] = this._encode(value, false, true);
        return this;
    };
    RxAVQuery.prototype.notEqualTo = function (key, value) {
        return this._addCondition(key, '$ne', value);
    };
    RxAVQuery.prototype.lessThan = function (key, value) {
        return this._addCondition(key, '$lt', value);
    };
    RxAVQuery.prototype.lessThanOrEqualTo = function (key, value) {
        return this._addCondition(key, '$lte', value);
    };
    RxAVQuery.prototype.greaterThan = function (key, value) {
        return this._addCondition(key, '$gt', value);
    };
    RxAVQuery.prototype.greaterThanOrEqualTo = function (key, value) {
        return this._addCondition(key, '$gte', value);
    };
    RxAVQuery.prototype.containedIn = function (key, value) {
        return this._addCondition(key, '$in', value);
    };
    RxAVQuery.prototype.notContainedIn = function (key, value) {
        return this._addCondition(key, '$nin', value);
    };
    RxAVQuery.prototype.containsAll = function (key, values) {
        return this._addCondition(key, '$all', values);
    };
    RxAVQuery.prototype.exists = function (key) {
        return this._addCondition(key, '$exists', true);
    };
    RxAVQuery.prototype.doesNotExist = function (key) {
        return this._addCondition(key, '$exists', false);
    };
    RxAVQuery.prototype.contains = function (key, value) {
        if (typeof value !== 'string') {
            throw new Error('The value being searched for must be a string.');
        }
        return this._addCondition(key, '$regex', this.quote(value));
    };
    RxAVQuery.prototype.startsWith = function (key, value) {
        if (typeof value !== 'string') {
            throw new Error('The value being searched for must be a string.');
        }
        return this._addCondition(key, '$regex', '^' + this.quote(value));
    };
    RxAVQuery.prototype.endsWith = function (key, value) {
        if (typeof value !== 'string') {
            throw new Error('The value being searched for must be a string.');
        }
        return this._addCondition(key, '$regex', this.quote(value) + '$');
    };
    RxAVQuery.prototype.quote = function (s) {
        return '\\Q' + s.replace('\\E', '\\E\\\\E\\Q') + '\\E';
    };
    RxAVQuery.prototype.relatedTo = function (parent, key) {
        this._addCondition('$relatedTo', 'object', {
            __type: 'Pointer',
            className: parent.className,
            objectId: parent.objectId
        });
        return this._addCondition('$relatedTo', 'key', key);
    };
    RxAVQuery.prototype.ascending = function () {
        var keys = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            keys[_i] = arguments[_i];
        }
        this._order = [];
        return this.addAscending.apply(this, keys);
    };
    RxAVQuery.prototype.addAscending = function () {
        var _this = this;
        var keys = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            keys[_i] = arguments[_i];
        }
        if (!this._order) {
            this._order = [];
        }
        keys.forEach(function (key) {
            if (Array.isArray(key)) {
                key = key.join();
            }
            _this._order = _this._order.concat(key.replace(/\s/g, '').split(','));
        });
        return this;
    };
    RxAVQuery.prototype.descending = function () {
        var keys = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            keys[_i] = arguments[_i];
        }
        this._order = [];
        return this.addDescending.apply(this, keys);
    };
    RxAVQuery.prototype.addDescending = function () {
        var _this = this;
        var keys = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            keys[_i] = arguments[_i];
        }
        if (!this._order) {
            this._order = [];
        }
        keys.forEach(function (key) {
            if (Array.isArray(key)) {
                key = key.join();
            }
            _this._order = _this._order.concat(key.replace(/\s/g, '').split(',').map(function (k) {
                return '-' + k;
            }));
        });
        return this;
    };
    RxAVQuery.prototype.skip = function (n) {
        if (typeof n !== 'number' || n < 0) {
            throw new Error('You can only skip by a positive number');
        }
        this._skip = n;
        return this;
    };
    RxAVQuery.prototype.limit = function (n) {
        if (typeof n !== 'number') {
            throw new Error('You can only set the limit to a numeric value');
        }
        this._limit = n;
        return this;
    };
    RxAVQuery.prototype.include = function () {
        var _this = this;
        var keys = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            keys[_i] = arguments[_i];
        }
        keys.forEach(function (key) {
            if (Array.isArray(key)) {
                _this._include = _this._include.concat(key);
            }
            else {
                _this._include.push(key);
            }
        });
        return this;
    };
    RxAVQuery.prototype.select = function () {
        var _this = this;
        var keys = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            keys[_i] = arguments[_i];
        }
        if (!this._select) {
            this._select = [];
        }
        keys.forEach(function (key) {
            if (Array.isArray(key)) {
                _this._select = _this._select.concat(key);
            }
            else {
                _this._select.push(key);
            }
        });
        return this;
    };
    /**
     * 执行查询
     *
     * @returns {Observable<Array<RxAVObject>>}
     *
     * @memberOf RxAVQuery
     */
    RxAVQuery.prototype.find = function () {
        var _this = this;
        return RxAVQuery._queryController.find(this, RxLeanCloud_1.RxAVUser.currentSessionToken).map(function (serverStates) {
            var resultList = serverStates.map(function (serverState, i, a) {
                var rxObject = new RxLeanCloud_1.RxAVObject(_this.className);
                rxObject.handleFetchResult(serverState);
                return rxObject;
            });
            if (resultList == undefined || resultList == null) {
                resultList = [];
            }
            return resultList;
        });
    };
    /**
     *
     *
     * @static
     * @param {...Array<RxAVQuery>} queries
     * @returns {RxAVQuery}
     *
     * @memberOf RxAVQuery
     */
    RxAVQuery.or = function () {
        var queries = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            queries[_i] = arguments[_i];
        }
        var className = null;
        queries.forEach(function (q) {
            if (!className) {
                className = q.className;
            }
            if (className !== q.className) {
                throw new Error('All queries must be for the same class.');
            }
        });
        var query = new RxAVQuery(className);
        query._orQuery(queries);
        return query;
    };
    RxAVQuery.prototype._orQuery = function (queries) {
        var queryJSON = queries.map(function (q) {
            return q._where;
        });
        this._where.$or = queryJSON;
        return this;
    };
    RxAVQuery.prototype._addCondition = function (key, condition, value) {
        if (!this._where[key] || typeof this._where[key] === 'string') {
            this._where[key] = {};
        }
        this._where[key][condition] = this._encode(value, false, true);
        return this;
    };
    RxAVQuery.prototype._encode = function (value, disallowObjects, forcePointers) {
        return RxAVQuery._encoder.encodeItem(value);
    };
    RxAVQuery.prototype.buildParameters = function (includeClassName) {
        if (includeClassName === void 0) { includeClassName = false; }
        var result = {};
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
    };
    return RxAVQuery;
}());
exports.RxAVQuery = RxAVQuery;
