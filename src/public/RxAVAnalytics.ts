import { Observable } from 'rxjs';
import { RxParseUser } from './RxAVUser';
import { RxParseClient, RxParseObject, ParseApp } from 'RxParse';
import { SDKPlugins } from '../internal/SDKPlugins';
import { IAnalyticsController } from '../internal/analytics/controller/IAnalyticsController';
import { IToolController } from '../internal/tool/controller/IToolController';
/**
 * 统计服务的操作接口
 * 当前版本只支持启动发送，也就是每一次启动之后，需要主动调用 report 接口去把上一次统计的数据发送到云端
 * 批量发送和最小时间间隔发送本质上也是拆分成每一个请求一次请求，容易出现发送中断等诸多原因，因此 ts sdk 只打算支持启动发送这一种方式
 * 
 * @export
 * @class RxAVAnalytics
 */
export class RxAVAnalytics {
    constructor(mutableData?: any, options?: any) {
        if (mutableData && mutableData != null) {
            this.enable = mutableData.enable;
            this.sessionId = mutableData.sessionId;
            this.policy = mutableData.policy;
            this.parameters = mutableData.parameters;
            this.device = mutableData.device;
            this.events = mutableData.events;
        }
        this._app = RxParseClient.instance.take(options);
    }

    static readonly analyticsCacheKey = 'LastAnalyticsData';

    protected static get _analyticsController() {
        return SDKPlugins.instance.AnalyticsControllerInstance;
    }
    private static _CurrentAnalytics: RxAVAnalytics;
    private static setCurrentAnalytics(analytics: RxAVAnalytics) {
        RxAVAnalytics._CurrentAnalytics = analytics;
    }
    static get _toolController() {
        return SDKPlugins.instance.ToolControllerInstance;
    }
    protected _app: ParseApp;
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
    public static get currentAnalytics() {
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
    public static init(app?: ParseApp): Observable<boolean> {
        return RxAVAnalytics._analyticsController.getPolicy(app).flatMap(instance => {
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
    public trackAppOpened(): void {
        this.trackEvent('!AV!AppOpen', '!AV!AppOpen', null);
    }

    /**
     * 标记本次应用打开来自于用户点击推送通知打开进入
     * 
     * @param {any} pushData :{ [key: string]: any } 推送内容包含的参数字典
     * 
     * @memberOf RxAVAnalytics
     */
    public trackAppOpenedWithPush(pushData?: { [key: string]: any }): void {
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
    public trackEvent(name: string, tag?: string, attributes?: { [key: string]: any }): string {
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
    public beginEevent(name: string, tag?: string, attributes?: { [key: string]: any }) {
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
    public endEvent(eventId: string, attributes?: { [key: string]: any }) {
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
    public trackPage(name: string, duration: number): string {
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
    public beginPage(name: string) {
        return this.trackPage(name, 0);
    }

    /**
     * 结束记录一个页面的持续性访问
     * 
     * @param {string} activityId 页面的 activitId
     * 
     * @memberOf RxAVAnalytics
     */
    public endPage(activityId: string) {
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
    public save(): Observable<boolean> {
        this.closeSesstion();
        if (SDKPlugins.instance.hasStorage) {
            return SDKPlugins.instance.LocalStorageControllerInstance.set(RxAVAnalytics.analyticsCacheKey, this).map(iStorage => {
                return iStorage != null;
            });
        }
        else return Observable.from([false]);
    }


    /**
     * 主动发送本次统计数据
     * 
     * @returns {Observable<boolean>} 发送结果，可能因为数据格式不正确而造成服务端拒收
     * 
     * @memberOf RxAVAnalytics
     */
    public send(): Observable<boolean> {
        if (!this.enable) {
            return Observable.from([false]);
        }
        return RxAVAnalytics._analyticsController.send(this, null);
    }

    /**
     * 
     * 停止 session
     * 
     * @memberOf RxAVAnalytics
     */
    public closeSesstion() {
        this.events.terminate.duration = RxAVAnalytics._toolController.getTimestamp('ms') - this.events.launch.date;
    }

    protected startSesstion() {
        return Observable.fromPromise(RxAVAnalytics._analyticsController.deviceProvider.getDevice()).map(deviceInfo => {
            this.device = deviceInfo;
            this.resetData();
            return true;
        });
    }

    protected resetData() {
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
    public static report() {
        return RxAVAnalytics.restore().flatMap(data => {
            return data.send();
        });
    }

    protected static restore() {
        if (SDKPlugins.instance.hasStorage) {
            return SDKPlugins.instance.LocalStorageControllerInstance.get(RxAVAnalytics.analyticsCacheKey).map(cacheData => {
                var cacheModel = new RxAVAnalytics(cacheData);
                return cacheModel;
            });
        }
    }

    sessionId: string;
    enable: boolean;
    policy: number;
    parameters: { [key: string]: any };
    device: RxAVAnalyticDevice;
    events: {
        event: Array<RxAVAnalyticEvent>,
        launch: RxAVAnalyticLaunch,
        terminate: RxAVAnalyticTerminate
    }

    encodeForSendServer() {
        return {
            device: this.device,
            events: this.events
        };
    }
}

export class RxAVAnalyticDevice {
    access: string;
    app_version: string;
    carrier: string;
    channel: string;
    device_id: string;
    device_model: string;
    display_name: string;
    iid: string;
    is_jailbroken: boolean;
    language: string;
    mc: string;
    os: string;
    os_version: string;
    package_name: string;
    resolution: string;
    sdk_version: string;
    sv: string;
    timezone: string;
}

export class RxAVAnalyticLaunch {
    constructor(sessionId: string) {
        this.date = RxAVAnalytics._toolController.getTimestamp('ms');
        this.sessionId = sessionId;
    }
    date: number;
    sessionId: string;
}

export class RxAVAnalyticTerminate {
    constructor(sessionId: string) {
        this.activities = [];
        this.sessionId = sessionId;
    }
    duration: number;
    sessionId: string;
    activities: Array<RxAVAnalyticActivity>;
}

export class RxAVAnalyticActivity {
    activityId: string;
    du: number;
    name: string;
    ts: number;
}

export class RxAVAnalyticEvent {
    constructor() {

    }
    eventId: string;
    du: number;
    name: string;
    sessionId: string;
    tag: string;
    ts: number;
    attributes: { [key: string]: any };
}
