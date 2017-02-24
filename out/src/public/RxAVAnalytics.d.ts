import { Observable } from 'rxjs';
import { IAnalyticsController } from '../internal/analytics/controller/IAnalyticsController';
import { IToolController } from '../internal/tool/controller/IToolController';
export declare class RxAVAnalytics {
    constructor();
    protected static readonly _analyticsController: IAnalyticsController;
    private static _CurrentAnalytics;
    private static setCurrentAnalytics(analytics);
    protected static readonly _toolController: IToolController;
    static readonly currentAnalytics: RxAVAnalytics;
    static init(): Observable<boolean>;
    trackAppOpened(): void;
    trackAppOpenedFromPush(): void;
    trackEvent(name: string, tag?: string, attributes?: {
        [key: string]: any;
    }): string;
    beginEevent(name: string, tag?: string, attributes?: {
        [key: string]: any;
    }): string;
    endEvent(eventId: string, attributes?: {
        [key: string]: any;
    }): void;
    trackPage(name: string, duration: number): string;
    beginPage(name: string): string;
    endPage(activityId: string): void;
    save(): Observable<boolean>;
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
