import { Observable } from 'rxjs';
import { RxAVUser } from './RxAVUser';
import { RxAVClient, RxAVObject } from '../RxLeanCloud';
import { SDKPlugins } from '../internal/SDKPlugins';
import { IAnalyticsController } from '../internal/analytics/controller/IAnalyticsController';
import { IToolController } from '../internal/tool/controller/IToolController';
export /**
 * RxAVAnalytics
 */
    class RxAVAnalytics {
    constructor() {

    }

    protected static get _analyticsController() {
        return SDKPlugins.instance.AnalyticsControllerInstance;
    }
    private static _CurrentAnalytics: RxAVAnalytics;
    private static setCurrentAnalytics(analytics: RxAVAnalytics) {
        RxAVAnalytics._CurrentAnalytics = analytics;
    }
    protected static get _toolController() {
        return SDKPlugins.instance.ToolControllerInstance;
    }

    public static get currentAnalytics() {
        return RxAVAnalytics._CurrentAnalytics;
    }

    public static init(): Observable<boolean> {
        return RxAVAnalytics._analyticsController.getPolicy().flatMap(instance => {
            RxAVAnalytics.setCurrentAnalytics(instance);
            return instance.startCollect();
        }).map(started => {
            return started && RxAVAnalytics.currentAnalytics.enable;
        });
    }

    public trackAppOpened() {
        this.trackEvent('!AV!AppOpen', null, null);
    }

    public trackAppOpenedFromPush() {
        this.trackEvent('!AV!PushOpen', null, null);
    }

    public trackEvent(name: string, tag?: string, attributes?: { [key: string]: any }): string {
        let newEvent = new RxAVAnalyticEvent();
        newEvent.eventId = `event_${RxAVAnalytics._toolController.newObjectId()}`;
        newEvent.attributes = attributes;
        newEvent.name = name;
        newEvent.timestamp = new Date().getTime();
        this.events.event.push(newEvent);
        return newEvent.eventId;
    }

    public beginEevent(name: string, tag?: string, attributes?: { [key: string]: any }) {
        return this.trackEvent(name, tag, attributes);
    }

    public endEvent(eventId: string, attributes?: { [key: string]: any }) {
        let begunEvent = this.events.event.find(e => {
            return e.eventId == eventId;
        });
        if (begunEvent != null) {
            begunEvent.duration = new Date().getTime() - begunEvent.timestamp;
            if (attributes && attributes != null) {
                for (let key in attributes) {
                    begunEvent.attributes[key] = attributes[key];
                }
            }
        }
    }

    public trackPage(name: string, duration: number) {
        let newActivity = new RxAVAnalyticActivity();
        newActivity.activityId = `activity_${RxAVAnalytics._toolController.newObjectId()}`;
        newActivity.ts = new Date().getTime();
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
            begunPage.du = new Date().getTime() - begunPage.ts;
        }
    }

    public save() {
        if (SDKPlugins.instance.hasStorage) {
            return SDKPlugins.instance.LocalStorageControllerInstance.set(this.sessionId, this.encodeForSendServer()).map(iStorage => {
                return iStorage != null;
            });
        }
        else return Observable.from([false]);
    }

    public send() {
        return RxAVAnalytics._analyticsController.send(this, null);
    }

    protected startCollect() {
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
        this.date = new Date().getTime();
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
    duration: number;
    name: string;
    sessionId: string;
    tag: string;
    timestamp: number;
    attributes: { [key: string]: any };
}
