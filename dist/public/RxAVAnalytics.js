"use strict";
var rxjs_1 = require('rxjs');
var SDKPlugins_1 = require('../internal/SDKPlugins');
var RxAVAnalytics = (function () {
    function RxAVAnalytics() {
    }
    Object.defineProperty(RxAVAnalytics, "_analyticsController", {
        get: function () {
            return SDKPlugins_1.SDKPlugins.instance.AnalyticsControllerInstance;
        },
        enumerable: true,
        configurable: true
    });
    RxAVAnalytics.setCurrentAnalytics = function (analytics) {
        RxAVAnalytics._CurrentAnalytics = analytics;
    };
    Object.defineProperty(RxAVAnalytics, "_toolController", {
        get: function () {
            return SDKPlugins_1.SDKPlugins.instance.ToolControllerInstance;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(RxAVAnalytics, "currentAnalytics", {
        get: function () {
            return RxAVAnalytics._CurrentAnalytics;
        },
        enumerable: true,
        configurable: true
    });
    RxAVAnalytics.init = function () {
        return RxAVAnalytics._analyticsController.getPolicy().flatMap(function (instance) {
            RxAVAnalytics.setCurrentAnalytics(instance);
            return instance.startCollect();
        }).map(function (started) {
            return started && RxAVAnalytics.currentAnalytics.enable;
        });
    };
    RxAVAnalytics.prototype.trackAppOpened = function () {
        this.trackEvent('!AV!AppOpen', null, null);
    };
    RxAVAnalytics.prototype.trackAppOpenedFromPush = function () {
        this.trackEvent('!AV!PushOpen', null, null);
    };
    RxAVAnalytics.prototype.trackEvent = function (name, tag, attributes) {
        var newEvent = new RxAVAnalyticEvent();
        newEvent.eventId = "event_" + RxAVAnalytics._toolController.newObjectId();
        newEvent.attributes = attributes;
        newEvent.name = name;
        newEvent.timestamp = new Date().getTime();
        this.events.event.push(newEvent);
        return newEvent.eventId;
    };
    RxAVAnalytics.prototype.beginEevent = function (name, tag, attributes) {
        return this.trackEvent(name, tag, attributes);
    };
    RxAVAnalytics.prototype.endEvent = function (eventId, attributes) {
        var begunEvent = this.events.event.find(function (e) {
            return e.eventId == eventId;
        });
        if (begunEvent != null) {
            begunEvent.duration = new Date().getTime() - begunEvent.timestamp;
            if (attributes && attributes != null) {
                for (var key in attributes) {
                    begunEvent.attributes[key] = attributes[key];
                }
            }
        }
    };
    RxAVAnalytics.prototype.trackPage = function (name, duration) {
        var newActivity = new RxAVAnalyticActivity();
        newActivity.activityId = "activity_" + RxAVAnalytics._toolController.newObjectId();
        newActivity.ts = new Date().getTime();
        newActivity.du = duration;
        newActivity.name = name;
        this.events.terminate.activities.push(newActivity);
        return newActivity.activityId;
    };
    RxAVAnalytics.prototype.beginPage = function (name) {
        return this.trackPage(name, 0);
    };
    RxAVAnalytics.prototype.endPage = function (activityId) {
        var begunPage = this.events.terminate.activities.find(function (a) {
            return a.activityId == activityId;
        });
        if (begunPage != null) {
            begunPage.du = new Date().getTime() - begunPage.ts;
        }
    };
    RxAVAnalytics.prototype.save = function () {
        if (SDKPlugins_1.SDKPlugins.instance.hasStorage) {
            return SDKPlugins_1.SDKPlugins.instance.LocalStorageControllerInstance.set(this.sessionId, this.encodeForSendServer()).map(function (iStorage) {
                return iStorage != null;
            });
        }
        else
            return rxjs_1.Observable.from([false]);
    };
    RxAVAnalytics.prototype.send = function () {
        return RxAVAnalytics._analyticsController.send(this, null);
    };
    RxAVAnalytics.prototype.startCollect = function () {
        var _this = this;
        return rxjs_1.Observable.fromPromise(RxAVAnalytics._analyticsController.deviceProvider.getDevice()).map(function (deviceInfo) {
            _this.device = deviceInfo;
            _this.resetData();
            return true;
        });
    };
    RxAVAnalytics.prototype.resetData = function () {
        this.sessionId = "session_" + RxAVAnalytics._toolController.newObjectId();
        this.events = {
            event: [],
            launch: new RxAVAnalyticLaunch(this.sessionId),
            terminate: new RxAVAnalyticTerminate(this.sessionId)
        };
    };
    RxAVAnalytics.prototype.encodeForSendServer = function () {
        return {
            device: this.device,
            events: this.events
        };
    };
    return RxAVAnalytics;
}());
exports.RxAVAnalytics = RxAVAnalytics;
var RxAVAnalyticDevice = (function () {
    function RxAVAnalyticDevice() {
    }
    return RxAVAnalyticDevice;
}());
exports.RxAVAnalyticDevice = RxAVAnalyticDevice;
var RxAVAnalyticLaunch = (function () {
    function RxAVAnalyticLaunch(sessionId) {
        this.date = new Date().getTime();
        this.sessionId = sessionId;
    }
    return RxAVAnalyticLaunch;
}());
exports.RxAVAnalyticLaunch = RxAVAnalyticLaunch;
var RxAVAnalyticTerminate = (function () {
    function RxAVAnalyticTerminate(sessionId) {
        this.activities = [];
        this.sessionId = sessionId;
    }
    return RxAVAnalyticTerminate;
}());
exports.RxAVAnalyticTerminate = RxAVAnalyticTerminate;
var RxAVAnalyticActivity = (function () {
    function RxAVAnalyticActivity() {
    }
    return RxAVAnalyticActivity;
}());
exports.RxAVAnalyticActivity = RxAVAnalyticActivity;
var RxAVAnalyticEvent = (function () {
    function RxAVAnalyticEvent() {
    }
    return RxAVAnalyticEvent;
}());
exports.RxAVAnalyticEvent = RxAVAnalyticEvent;
