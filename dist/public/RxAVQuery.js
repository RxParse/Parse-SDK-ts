"use strict";
var RxLeanCloud_1 = require('../RxLeanCloud');
var SDKPlugins_1 = require('../internal/SDKPlugins');
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
    RxAVQuery.prototype.ascending = function () {
        var keys = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            keys[_i - 0] = arguments[_i];
        }
        this._order = [];
        return this.addAscending.apply(this, keys);
    };
    RxAVQuery.prototype.addAscending = function () {
        var _this = this;
        var keys = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            keys[_i - 0] = arguments[_i];
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
            keys[_i - 0] = arguments[_i];
        }
        this._order = [];
        return this.addDescending.apply(this, keys);
    };
    RxAVQuery.prototype.addDescending = function () {
        var _this = this;
        var keys = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            keys[_i - 0] = arguments[_i];
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
            keys[_i - 0] = arguments[_i];
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
            keys[_i - 0] = arguments[_i];
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
