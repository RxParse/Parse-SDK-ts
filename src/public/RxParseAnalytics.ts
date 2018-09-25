import { Observable } from 'rxjs';
import { ParseClient, ParseApp } from '../RxParse';
import { SDKPlugins } from '../internal/SDKPlugins';
import { IParseAnalyticsController } from '../internal/analytics/controller/IParseAnalyticsController';
import { IToolController } from '../internal/tool/controller/IToolController';

/**
 *
 *
 * @export
 * @class RxParseAnalytics
 */
export class RxParseAnalytics {
    constructor(mutableData?: any, options?: any) {
        if (mutableData && mutableData != null) {
            this.enable = mutableData.enable;
            this.sessionId = mutableData.sessionId;
            this.policy = mutableData.policy;
            this.parameters = mutableData.parameters;
            this.device = mutableData.device;
            this.events = mutableData.events;
        }
        this._app = ParseClient.instance.take(options);
    }

    static readonly analyticsCacheKey = 'LastAnalyticsData';

    protected static get _analyticsController(): IParseAnalyticsController {
        return SDKPlugins.instance.AnalyticsControllerInstance;
    }

    private static _CurrentAnalytics: RxParseAnalytics;
    private static setCurrentAnalytics(analytics: RxParseAnalytics) {
        RxParseAnalytics._CurrentAnalytics = analytics;
    }

    static get _toolController(): IToolController {
        return SDKPlugins.instance.ToolControllerInstance;
    }

    protected _app: ParseApp;
    get app() {
        return this._app;
    }

    public static get currentAnalytics() {
        return RxParseAnalytics._CurrentAnalytics;
    }

    public static init(app?: ParseApp): Observable<boolean> {
        return RxParseAnalytics._analyticsController.getPolicy(app).flatMap(instance => {
            RxParseAnalytics.setCurrentAnalytics(instance);
            return instance.startSession();
        }).map(started => {
            return started && RxParseAnalytics.currentAnalytics.enable;
        });
    }

    public trackAppOpened(): void {
        this.trackEvent('!AV!AppOpen', '!AV!AppOpen', null);
    }

    public trackAppOpenedWithPush(pushData?: { [key: string]: any }): void {
        this.trackEvent('!AV!PushOpen', '!AV!PushOpen', pushData);
    }

    public trackEvent(name: string, tag?: string, attributes?: { [key: string]: any }): string {
        let newEvent = new RxParseAnalyticEvent();
        newEvent.eventId = `event_${RxParseAnalytics._toolController.newObjectId()}`;
        newEvent.attributes = attributes;
        newEvent.name = name;
        newEvent.du = 0;
        newEvent.tag = tag;
        newEvent.ts = RxParseAnalytics._toolController.getTimestamp('ms');
        newEvent.sessionId = this.sessionId;
        this.events.event.push(newEvent);
        return newEvent.eventId;
    }


    /**
     *
     *
     * @param {string} name
     * @param {string} [tag]
     * @param {{ [key: string]: any }} [attributes]
     * @returns
     * @memberof RxParseAnalytics
     */
    public beginEvent(name: string, tag?: string, attributes?: { [key: string]: any }) {
        return this.trackEvent(name, tag, attributes);
    }

    public endEvent(eventId: string, attributes?: { [key: string]: any }) {
        let begunEvent = this.events.event.find(e => {
            return e.eventId == eventId;
        });
        if (begunEvent != null) {
            begunEvent.du = RxParseAnalytics._toolController.getTimestamp('ms') - begunEvent.ts;
            if (attributes && attributes != null) {
                for (let key in attributes) {
                    begunEvent.attributes[key] = attributes[key];
                }
            }
        }
    }

    public trackPage(name: string, duration: number): string {
        let newActivity = new RxParseAnalyticActivity();
        newActivity.activityId = `activity_${RxParseAnalytics._toolController.newObjectId()}`;
        newActivity.ts = RxParseAnalytics._toolController.getTimestamp('ms');
        newActivity.du = duration;
        newActivity.name = name;
        this.events.terminate.activities.push(newActivity);
        return newActivity.activityId;
    }

    public beginPage(name: string) {
        return this.trackPage(name, 0);
    }

    public endPage(activityId: string) {
        let begunPage = this.events.terminate.activities.find(a => {
            return a.activityId == activityId;
        });
        if (begunPage != null) {
            begunPage.du = RxParseAnalytics._toolController.getTimestamp('ms') - begunPage.ts;
        }
    }

    public save(): Observable<boolean> {
        this.closeSession();
        if (SDKPlugins.instance.hasStorage) {
            return SDKPlugins.instance.LocalStorageControllerInstance.set(RxParseAnalytics.analyticsCacheKey, this).map(iStorage => {
                return iStorage != null;
            });
        }
        else return Observable.from([false]);
    }


    public send(): Observable<boolean> {
        if (!this.enable) {
            return Observable.from([false]);
        }
        return RxParseAnalytics._analyticsController.send(this, null);
    }

    public closeSession() {
        this.events.terminate.duration = RxParseAnalytics._toolController.getTimestamp('ms') - this.events.launch.date;
    }

    protected startSession() {
        return Observable.fromPromise(RxParseAnalytics._analyticsController.deviceProvider.getDevice()).map(deviceInfo => {
            this.device = deviceInfo;
            this.resetData();
            return true;
        });
    }

    protected resetData() {
        this.sessionId = `session_${RxParseAnalytics._toolController.newObjectId()}`;
        this.events = {
            event: [],
            launch: new RxParseAnalyticLaunch(this.sessionId),
            terminate: new RxParseAnalyticTerminate(this.sessionId)
        };
    }

    public static report() {
        return RxParseAnalytics.restore().flatMap(data => {
            return data.send();
        });
    }

    protected static restore() {
        if (SDKPlugins.instance.hasStorage) {
            return SDKPlugins.instance.LocalStorageControllerInstance.get(RxParseAnalytics.analyticsCacheKey).map(cacheData => {
                var cacheModel = new RxParseAnalytics(cacheData);
                return cacheModel;
            });
        }
    }

    sessionId: string;
    enable: boolean;
    policy: number;
    parameters: { [key: string]: any };
    device: RxParseAnalyticDevice;
    events: {
        event: Array<RxParseAnalyticEvent>,
        launch: RxParseAnalyticLaunch,
        terminate: RxParseAnalyticTerminate
    }

    encodeForSendServer() {
        return {
            device: this.device,
            events: this.events
        };
    }
}

export class RxParseAnalyticDevice {
    access: string;
    app_version: string;
    carrier: string;
    channel: string;
    device_id: string;
    device_model: string;
    display_name: string;
    iid: string;
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

export class RxParseAnalyticLaunch {
    constructor(sessionId: string) {
        this.date = RxParseAnalytics._toolController.getTimestamp('ms');
        this.sessionId = sessionId;
    }
    date: number;
    sessionId: string;
}

export class RxParseAnalyticTerminate {
    constructor(sessionId: string) {
        this.activities = [];
        this.sessionId = sessionId;
    }
    duration: number;
    sessionId: string;
    activities: Array<RxParseAnalyticActivity>;
}

export class RxParseAnalyticActivity {
    activityId: string;
    du: number;
    name: string;
    ts: number;
}

export class RxParseAnalyticEvent {
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
