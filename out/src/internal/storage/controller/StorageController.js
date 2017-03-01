"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var rxjs_1 = require("rxjs");
var StorageController = (function () {
    function StorageController(storageProvider) {
        this.storageFileName = 'RxApplicationSettings';
        this.dictionary = null;
        if (storageProvider)
            this.provider = storageProvider;
    }
    StorageController.prototype.load = function () {
        var _this = this;
        if (!this.provider) {
            console.warn('can not find a Storage Provider.');
            return rxjs_1.Observable.from([null]);
        }
        var obs = rxjs_1.Observable.fromPromise(this.provider.get(this.storageFileName));
        return obs.map(function (data) {
            _this.dictionary = JSON.parse(data);
            _this.isDirty = false;
            return _this.provider;
        });
    };
    StorageController.prototype.save = function (contents) {
        this.dictionary = contents;
        if (!this.provider) {
            console.warn('can not find a Storage Provider.');
            return rxjs_1.Observable.from([null]);
        }
        var jsonString = JSON.stringify(this.dictionary);
        this.provider.add(this.storageFileName, jsonString);
        return rxjs_1.Observable.from([this.provider]);
    };
    StorageController.prototype.get = function (key) {
        var _this = this;
        if (this.dictionary != null)
            return rxjs_1.Observable.from([this.dictionary[key]]);
        else {
            return this.load().map(function (provider) {
                if (_this.dictionary != null)
                    return _this.dictionary[key];
                else
                    return null;
            });
        }
    };
    StorageController.prototype.set = function (key, value) {
        if (this.dictionary == null)
            this.dictionary = {};
        this.isDirty = true;
        this.dictionary[key] = value;
        return this.save(this.dictionary);
    };
    StorageController.prototype.remove = function (key) {
        delete this.dictionary[key];
        return this.save(this.dictionary);
    };
    return StorageController;
}());
exports.StorageController = StorageController;
