"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var rxjs_1 = require("rxjs");
var SDKPlugins_1 = require("../internal/SDKPlugins");
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
        /**
         * 获取本地对话的统计对象
         *
         * @readonly
         * @static
         *
         * @memberOf RxAVAnalytics
         */
        get: function () {
            return RxAVAnalytics._CurrentAnalytics;
        },
        enumerable: true,
        configurable: true
    });
    /**
     * 初始化统计对象，初始化成功之后可以通过 {RxAVAnalytics.currentAnalytics} 实例对象来记录统计数据
     *
     * @static
     * @returns {Observable<boolean>}
     *
     * @memberOf RxAVAnalytics
     */
    RxAVAnalytics.init = function () {
        return RxAVAnalytics._analyticsController.getPolicy().flatMap(function (instance) {
            RxAVAnalytics.setCurrentAnalytics(instance);
            return instance.startCollect();
        }).map(function (started) {
            return started && RxAVAnalytics.currentAnalytics.enable;
        });
    };
    /**
     *  标记本次应用打开是来自于用户主动打开
     *
     *
     * @memberOf RxAVAnalytics
     */
    RxAVAnalytics.prototype.trackAppOpened = function () {
        this.trackEvent('!AV!AppOpen', null, null);
    };
    /**
     * 标记本次应用打开是来自于推送
     *
     *
     * @memberOf RxAVAnalytics
     */
    RxAVAnalytics.prototype.trackAppOpenedFromPush = function () {
        this.trackEvent('!AV!PushOpen', null, null);
    };
    /**
     * 记录一次自定义事件
     *
     * @param {string} name 事件的自定义名称
     * @param {string} [tag] 时间的附加值
     * @param {{ [key: string]: any }} [attributes] 事件的自定义属性字典
     * @returns {string}
     *
     * @memberOf RxAVAnalytics
     */
    RxAVAnalytics.prototype.trackEvent = function (name, tag, attributes) {
        var newEvent = new RxAVAnalyticEvent();
        newEvent.eventId = "event_" + RxAVAnalytics._toolController.newObjectId();
        newEvent.attributes = attributes;
        newEvent.name = name;
        newEvent.timestamp = new Date().getTime();
        this.events.event.push(newEvent);
        return newEvent.eventId;
    };
    /**
     * 开始记录一次持续性事件
     *
     * @param {string} name 事件的自定义名称
     * @param {string} [tag] 事件的附加值
     * @param {{ [key: string]: any }} [attributes] 事件的自定义属性字典
     * @returns 返回该事件的 eventId
     *
     * @memberOf RxAVAnalytics
     */
    RxAVAnalytics.prototype.beginEevent = function (name, tag, attributes) {
        return this.trackEvent(name, tag, attributes);
    };
    /**
     * 结束记录一次自定义事件
     *
     * @param {string} eventId  事件的 eventId
     * @param {{ [key: string]: any }} [attributes] 事件的自定义属性字典
     *
     * @memberOf RxAVAnalytics
     */
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
    /**
     * 记录一个页面的访问时间
     *
     * @param {string} name 页面名称
     * @param {number} duration 访问持续的时间，毫秒
     * @returns 页面的 activitId
     *
     * @memberOf RxAVAnalytics
     */
    RxAVAnalytics.prototype.trackPage = function (name, duration) {
        var newActivity = new RxAVAnalyticActivity();
        newActivity.activityId = "activity_" + RxAVAnalytics._toolController.newObjectId();
        newActivity.ts = new Date().getTime();
        newActivity.du = duration;
        newActivity.name = name;
        this.events.terminate.activities.push(newActivity);
        return newActivity.activityId;
    };
    /**
     * 开始记录一个页面的持续性访问
     *
     * @param {string} name 页面名称
     * @returns 页面的 activitId
     *
     * @memberOf RxAVAnalytics
     */
    RxAVAnalytics.prototype.beginPage = function (name) {
        return this.trackPage(name, 0);
    };
    /**
     * 结束记录一个页面的持续性访问
     *
     * @param {string} activityId 页面的 activitId
     *
     * @memberOf RxAVAnalytics
     */
    RxAVAnalytics.prototype.endPage = function (activityId) {
        var begunPage = this.events.terminate.activities.find(function (a) {
            return a.activityId == activityId;
        });
        if (begunPage != null) {
            begunPage.du = new Date().getTime() - begunPage.ts;
        }
    };
    /**
     *  如果实现了本地缓存的接口，那么可以将本地统计数据保存在本地的缓存内
     *
     * @returns
     *
     * @memberOf RxAVAnalytics
     */
    RxAVAnalytics.prototype.save = function () {
        if (SDKPlugins_1.SDKPlugins.instance.hasStorage) {
            return SDKPlugins_1.SDKPlugins.instance.LocalStorageControllerInstance.set(this.sessionId, this.encodeForSendServer()).map(function (iStorage) {
                return iStorage != null;
            });
        }
        else
            return rxjs_1.Observable.from([false]);
    };
    /**
     * 主动发送本次统计数据
     *
     * @returns
     *
     * @memberOf RxAVAnalytics
     */
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
