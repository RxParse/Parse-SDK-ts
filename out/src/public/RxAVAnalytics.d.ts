import { Observable } from 'rxjs';
import { IAnalyticsController } from '../internal/analytics/controller/IAnalyticsController';
import { IToolController } from '../internal/tool/controller/IToolController';
export declare class RxAVAnalytics {
    constructor();
    protected static readonly _analyticsController: IAnalyticsController;
    private static _CurrentAnalytics;
    private static setCurrentAnalytics(analytics);
    protected static readonly _toolController: IToolController;
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
     *  标记本次应用打开是来自于用户主动打开
     *
     *
     * @memberOf RxAVAnalytics
     */
    trackAppOpened(): void;
    /**
     * 标记本次应用打开是来自于推送
     *
     *
     * @memberOf RxAVAnalytics
     */
    trackAppOpenedFromPush(): void;
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
    trackEvent(name: string, tag?: string, attributes?: {
        [key: string]: any;
    }): string;
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
    beginEevent(name: string, tag?: string, attributes?: {
        [key: string]: any;
    }): string;
    /**
     * 结束记录一次自定义事件
     *
     * @param {string} eventId  事件的 eventId
     * @param {{ [key: string]: any }} [attributes] 事件的自定义属性字典
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
     * @returns 页面的 activitId
     *
     * @memberOf RxAVAnalytics
     */
    trackPage(name: string, duration: number): string;
    /**
     * 开始记录一个页面的持续性访问
     *
     * @param {string} name 页面名称
     * @returns 页面的 activitId
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
     * @returns
     *
     * @memberOf RxAVAnalytics
     */
    save(): Observable<boolean>;
    /**
     * 主动发送本次统计数据
     *
     * @returns
     *
     * @memberOf RxAVAnalytics
     */
    send(): Observable<boolean>;
    protected startCollect(): Observable<boolean>;
    protected resetData(): void;
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
    duration: number;
    name: string;
    sessionId: string;
    tag: string;
    timestamp: number;
    attributes: {
        [key: string]: any;
    };
}
