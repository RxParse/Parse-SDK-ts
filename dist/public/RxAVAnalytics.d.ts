import { Observable } from 'rxjs';
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
export declare class RxAVAnalytics {
    constructor(mutableData?: any);
    static readonly analyticsCacheKey: string;
    protected static readonly _analyticsController: IAnalyticsController;
    private static _CurrentAnalytics;
    private static setCurrentAnalytics(analytics);
    static readonly _toolController: IToolController;
    /**
     * 获取本地对话的统计对象
     *
     * @readonly
     * @static
     *
     * @memberOf RxAVAnalytics
     */
    static readonly currentAnalytics: RxAVAnalytics;
    /**
     * 初始化统计对象，初始化成功之后可以通过 {RxAVAnalytics.currentAnalytics} 实例对象来记录统计数据
     *
     * @static
     * @returns {Observable<boolean>}
     *
     * @memberOf RxAVAnalytics
     */
    static init(): Observable<boolean>;
    /**
     * 标记本次应用打开来自于用户手动从图标点开进入
     *
     *
     * @memberOf RxAVAnalytics
     */
    trackAppOpened(): void;
    /**
     * 标记本次应用打开来自于用户点击推送通知打开进入
     *
     * @param {any} pushData :{ [key: string]: any } 推送内容包含的参数字典
     *
     * @memberOf RxAVAnalytics
     */
    trackAppOpenedWithPush(pushData?: {
        [key: string]: any;
    }): void;
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
    trackEvent(name: string, tag?: string, attributes?: {
        [key: string]: any;
    }): string;
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
    beginEevent(name: string, tag?: string, attributes?: {
        [key: string]: any;
    }): string;
    /**
     * 结束记录一次自定义事件
     *
     * @param {string} eventId  事件的 eventId
     * @param {any} [attributes] 事件的自定义属性字典
     *
     * @memberOf RxAVAnalytics
     */
    endEvent(eventId: string, attributes?: {
        [key: string]: any;
    }): void;
    /**
     * 记录一个页面的访问时间
     *
     * @param {string} name 页面名称
     * @param {number} duration 访问持续的时间，毫秒
     * @returns {string} 页面的 activitId
     *
     * @memberOf RxAVAnalytics
     */
    trackPage(name: string, duration: number): string;
    /**
     * 开始记录一个页面的持续性访问
     *
     * @param {string} name 页面名称
     * @returns {string} 页面的 activitId
     *
     * @memberOf RxAVAnalytics
     */
    beginPage(name: string): string;
    /**
     * 结束记录一个页面的持续性访问
     *
     * @param {string} activityId 页面的 activitId
     *
     * @memberOf RxAVAnalytics
     */
    endPage(activityId: string): void;
    /**
     *  如果实现了本地缓存的接口，那么可以将本地统计数据保存在本地的缓存内
     *
     * @returns {Observable<boolean>} 发送结果，可能因为并没有实现本地缓存的接口而导致失败
     *
     * @memberOf RxAVAnalytics
     */
    save(): Observable<boolean>;
    /**
     * 主动发送本次统计数据
     *
     * @returns {Observable<boolean>} 发送结果，可能因为数据格式不正确而造成服务端拒收
     *
     * @memberOf RxAVAnalytics
     */
    send(): Observable<boolean>;
    /**
     *
     * 停止 session
     *
     * @memberOf RxAVAnalytics
     */
    closeSesstion(): void;
    protected startSesstion(): Observable<boolean>;
    protected resetData(): void;
    /**
     * 将上一次对话的统计数据报告给服务端
     *
     * @static
     *
     * @memberOf RxAVAnalytics
     */
    static report(): Observable<any>;
    protected static restore(): Observable<RxAVAnalytics>;
    sessionId: string;
    enable: boolean;
    policy: number;
    parameters: {
        [key: string]: any;
    };
    device: RxAVAnalyticDevice;
    events: {
        event: Array<RxAVAnalyticEvent>;
        launch: RxAVAnalyticLaunch;
        terminate: RxAVAnalyticTerminate;
    };
    encodeForSendServer(): {
        device: RxAVAnalyticDevice;
        events: {
            event: RxAVAnalyticEvent[];
            launch: RxAVAnalyticLaunch;
            terminate: RxAVAnalyticTerminate;
        };
    };
}
export declare class RxAVAnalyticDevice {
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
export declare class RxAVAnalyticLaunch {
    constructor(sessionId: string);
    date: number;
    sessionId: string;
}
export declare class RxAVAnalyticTerminate {
    constructor(sessionId: string);
    duration: number;
    sessionId: string;
    activities: Array<RxAVAnalyticActivity>;
}
export declare class RxAVAnalyticActivity {
    activityId: string;
    du: number;
    name: string;
    ts: number;
}
export declare class RxAVAnalyticEvent {
    constructor();
    eventId: string;
    du: number;
    name: string;
    sessionId: string;
    tag: string;
    ts: number;
    attributes: {
        [key: string]: any;
    };
}
