"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const rxjs_1 = require("rxjs");
const RxLeanCloud_1 = require("../RxLeanCloud");
const SDKPlugins_1 = require("../internal/SDKPlugins");
/**
 * 统计服务的操作接口
 * 当前版本只支持启动发送，也就是每一次启动之后，需要主动调用 report 接口去把上一次统计的数据发送到云端
 * 批量发送和最小时间间隔发送本质上也是拆分成每一个请求一次请求，容易出现发送中断等诸多原因，因此 ts sdk 只打算支持启动发送这一种方式
 *
 * @export
 * @class RxAVAnalytics
 */
class RxAVAnalytics {
    constructor(mutableData, options) {
        if (mutableData && mutableData != null) {
            this.enable = mutableData.enable;
            this.sessionId = mutableData.sessionId;
            this.policy = mutableData.policy;
            this.parameters = mutableData.parameters;
            this.device = mutableData.device;
            this.events = mutableData.events;
        }
        this._app = RxLeanCloud_1.RxAVClient.instance.take(options);
    }
    static get _analyticsController() {
        return SDKPlugins_1.SDKPlugins.instance.AnalyticsControllerInstance;
    }
    static setCurrentAnalytics(analytics) {
        RxAVAnalytics._CurrentAnalytics = analytics;
    }
    static get _toolController() {
        return SDKPlugins_1.SDKPlugins.instance.ToolControllerInstance;
    }
    get app() {
        return this._app;
    }
    /**
     * 获取本地对话的统计对象
     *
     * @readonly
     * @static
     *
     * @memberOf RxAVAnalytics
     */
    static get currentAnalytics() {
        return RxAVAnalytics._CurrentAnalytics;
    }
    /**
     * 初始化统计对象，初始化成功之后可以通过 {RxAVAnalytics.currentAnalytics} 实例对象来记录统计数据
     *
     * @static
     * @returns {Observable<boolean>}
     *
     * @memberOf RxAVAnalytics
     */
    static init() {
        return RxAVAnalytics._analyticsController.getPolicy().flatMap(instance => {
            RxAVAnalytics.setCurrentAnalytics(instance);
            return instance.startSesstion();
        }).map(started => {
            return started && RxAVAnalytics.currentAnalytics.enable;
        });
    }
    /**
     * 标记本次应用打开来自于用户手动从图标点开进入
     *
     *
     * @memberOf RxAVAnalytics
     */
    trackAppOpened() {
        this.trackEvent('!AV!AppOpen', '!AV!AppOpen', null);
    }
    /**
     * 标记本次应用打开来自于用户点击推送通知打开进入
     *
     * @param {any} pushData :{ [key: string]: any } 推送内容包含的参数字典
     *
     * @memberOf RxAVAnalytics
     */
    trackAppOpenedWithPush(pushData) {
        this.trackEvent('!AV!PushOpen', '!AV!PushOpen', pushData);
    }
    /**
     * 记录一次自定义事件
     *
     * @param {string} name 事件的自定义名称
     * @param {string} [tag] 时间的附加值
     * @param {any} [attributes] 事件的自定义属性字典
     * @returns {string} 自定义事件的 ID
     *
     * @memberOf RxAVAnalytics
     */
    trackEvent(name, tag, attributes) {
        let newEvent = new RxAVAnalyticEvent();
        newEvent.eventId = `event_${RxAVAnalytics._toolController.newObjectId()}`;
        newEvent.attributes = attributes;
        newEvent.name = name;
        newEvent.du = 0;
        newEvent.tag = tag;
        newEvent.ts = RxAVAnalytics._toolController.getTimestamp('ms');
        newEvent.sessionId = this.sessionId;
        this.events.event.push(newEvent);
        return newEvent.eventId;
    }
    /**
     * 开始记录一次持续性事件
     *
     * @param {string} name 事件的自定义名称
     * @param {string} [tag] 事件的附加值
     * @param {any} [attributes] 事件的自定义属性字典
     * @returns {string} 返回该事件的 eventId
     *
     * @memberOf RxAVAnalytics
     */
    beginEevent(name, tag, attributes) {
        return this.trackEvent(name, tag, attributes);
    }
    /**
     * 结束记录一次自定义事件
     *
     * @param {string} eventId  事件的 eventId
     * @param {any} [attributes] 事件的自定义属性字典
     *
     * @memberOf RxAVAnalytics
     */
    endEvent(eventId, attributes) {
        let begunEvent = this.events.event.find(e => {
            return e.eventId == eventId;
        });
        if (begunEvent != null) {
            begunEvent.du = RxAVAnalytics._toolController.getTimestamp('ms') - begunEvent.ts;
            if (attributes && attributes != null) {
                for (let key in attributes) {
                    begunEvent.attributes[key] = attributes[key];
                }
            }
        }
    }
    /**
     * 记录一个页面的访问时间
     *
     * @param {string} name 页面名称
     * @param {number} duration 访问持续的时间，毫秒
     * @returns {string} 页面的 activitId
     *
     * @memberOf RxAVAnalytics
     */
    trackPage(name, duration) {
        let newActivity = new RxAVAnalyticActivity();
        newActivity.activityId = `activity_${RxAVAnalytics._toolController.newObjectId()}`;
        newActivity.ts = RxAVAnalytics._toolController.getTimestamp('ms');
        newActivity.du = duration;
        newActivity.name = name;
        this.events.terminate.activities.push(newActivity);
        return newActivity.activityId;
    }
    /**
     * 开始记录一个页面的持续性访问
     *
     * @param {string} name 页面名称
     * @returns {string} 页面的 activitId
     *
     * @memberOf RxAVAnalytics
     */
    beginPage(name) {
        return this.trackPage(name, 0);
    }
    /**
     * 结束记录一个页面的持续性访问
     *
     * @param {string} activityId 页面的 activitId
     *
     * @memberOf RxAVAnalytics
     */
    endPage(activityId) {
        let begunPage = this.events.terminate.activities.find(a => {
            return a.activityId == activityId;
        });
        if (begunPage != null) {
            begunPage.du = RxAVAnalytics._toolController.getTimestamp('ms') - begunPage.ts;
        }
    }
    /**
     *  如果实现了本地缓存的接口，那么可以将本地统计数据保存在本地的缓存内
     *
     * @returns {Observable<boolean>} 发送结果，可能因为并没有实现本地缓存的接口而导致失败
     *
     * @memberOf RxAVAnalytics
     */
    save() {
        this.closeSesstion();
        if (SDKPlugins_1.SDKPlugins.instance.hasStorage) {
            return SDKPlugins_1.SDKPlugins.instance.LocalStorageControllerInstance.set(RxAVAnalytics.analyticsCacheKey, this).map(iStorage => {
                return iStorage != null;
            });
        }
        else
            return rxjs_1.Observable.from([false]);
    }
    /**
     * 主动发送本次统计数据
     *
     * @returns {Observable<boolean>} 发送结果，可能因为数据格式不正确而造成服务端拒收
     *
     * @memberOf RxAVAnalytics
     */
    send() {
        if (!this.enable) {
            return rxjs_1.Observable.from([false]);
        }
        return RxAVAnalytics._analyticsController.send(this, null);
    }
    /**
     *
     * 停止 session
     *
     * @memberOf RxAVAnalytics
     */
    closeSesstion() {
        this.events.terminate.duration = RxAVAnalytics._toolController.getTimestamp('ms') - this.events.launch.date;
    }
    startSesstion() {
        return rxjs_1.Observable.fromPromise(RxAVAnalytics._analyticsController.deviceProvider.getDevice()).map(deviceInfo => {
            this.device = deviceInfo;
            this.resetData();
            return true;
        });
    }
    resetData() {
        this.sessionId = `session_${RxAVAnalytics._toolController.newObjectId()}`;
        this.events = {
            event: [],
            launch: new RxAVAnalyticLaunch(this.sessionId),
            terminate: new RxAVAnalyticTerminate(this.sessionId)
        };
    }
    /**
     * 将上一次对话的统计数据报告给服务端
     *
     * @static
     *
     * @memberOf RxAVAnalytics
     */
    static report() {
        return RxAVAnalytics.restore().flatMap(data => {
            return data.send();
        });
    }
    static restore() {
        if (SDKPlugins_1.SDKPlugins.instance.hasStorage) {
            return SDKPlugins_1.SDKPlugins.instance.LocalStorageControllerInstance.get(RxAVAnalytics.analyticsCacheKey).map(cacheData => {
                var cacheModel = new RxAVAnalytics(cacheData);
                return cacheModel;
            });
        }
    }
    encodeForSendServer() {
        return {
            device: this.device,
            events: this.events
        };
    }
}
RxAVAnalytics.analyticsCacheKey = 'LastAnalyticsData';
exports.RxAVAnalytics = RxAVAnalytics;
class RxAVAnalyticDevice {
}
exports.RxAVAnalyticDevice = RxAVAnalyticDevice;
class RxAVAnalyticLaunch {
    constructor(sessionId) {
        this.date = RxAVAnalytics._toolController.getTimestamp('ms');
        this.sessionId = sessionId;
    }
}
exports.RxAVAnalyticLaunch = RxAVAnalyticLaunch;
class RxAVAnalyticTerminate {
    constructor(sessionId) {
        this.activities = [];
        this.sessionId = sessionId;
    }
}
exports.RxAVAnalyticTerminate = RxAVAnalyticTerminate;
class RxAVAnalyticActivity {
}
exports.RxAVAnalyticActivity = RxAVAnalyticActivity;
class RxAVAnalyticEvent {
    constructor() {
    }
}
exports.RxAVAnalyticEvent = RxAVAnalyticEvent;
