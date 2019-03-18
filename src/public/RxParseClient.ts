import { SDKPlugins } from '../internal/ParseClientPlugins';
import { ParseCommand } from '../internal/command/ParseCommand';
import { IStorage } from '../internal/storage/IStorage';
import { IWebSocketClient } from '../internal/websocket/IWebSocketClient';
import { StorageController } from '../internal/storage/controller/StorageController';
import { Observable } from 'rxjs';
import { map, flatMap } from 'rxjs/operators';
import { HttpRequest } from '../internal/httpClient/HttpRequest';
import { HttpResponse } from '../internal/httpClient/HttpResponse';

var sdkInfo = require('../package.json');

export class ParseClientConfig {
    apps?: Array<ParseAppConfig>;
    log?: boolean;
    pluginVersion?: number;
    isNode?: boolean;
    plugins?: {
        storage?: IStorage,
        websocket?: IWebSocketClient
    }
}

export class ParseClient {

    /**
     *
     *
     * @static
     * @param {ParseClientConfig} [config]
     * @returns {ParseClient}
     * @memberof ParseClient
     */
    static init(config?: ParseClientConfig): ParseClient {
        return ParseClient.instance.initialize(config);
    }

    currentApp: ParseApp;
    remotes: Array<ParseApp> = [];
    add(app: ParseApp, replace?: boolean) {
        if (this.remotes.length == 0 || (typeof replace != 'undefined' && replace)) {
            if (app.shortName == null) {
                app.shortName = 'default';
            }
            this.currentApp = app;
        }
        this.remotes.push(app);
        this.printWelcome(app);
        return this as ParseClient;
    }

    take(options?: any) {
        let app: ParseApp = null;
        if (!options) {
            return ParseClient.instance.currentApp;
        } else {
            if (options.app) {
                if (options.app instanceof ParseApp) {
                    app = options.app;
                }
            } else if (options.appName) {
                if (typeof options.appName === "string") {
                    let tempApp = this.remotes.find(a => {
                        return a.shortName == options.appName;
                    });
                    if (tempApp) {
                        app = tempApp;
                    }
                }
            } else {
                app = ParseClient.instance.currentApp;
            }
        }
        return app;
    }

    private _switch(shortname: string) {
        let tempApp = this.remotes.find(app => {
            return app.shortName == shortname;
        });
        if (tempApp) {
            this.currentApp = tempApp;
        }
        return this as ParseClient;
    }


    public get SDKVersion(): string {
        return sdkInfo.version;
    }

    public isNode() {
        return this.currentConfiguration.isNode;
    }

    public static inLeanEngine() {
        return false;
    }

    protected printWelcome(app: ParseApp) {
        ParseClient.printLog('=== LeanCloud-Typescript-Rx-SDK ===');
        ParseClient.printLog(`pluginVersion:${this.currentConfiguration.pluginVersion}`);
        ParseClient.printLog(`environment:node?${this.currentConfiguration.isNode}`);
        ParseClient.printLog(`appId:${app.appId}`);
        ParseClient.printLog(`serverURL:${app.serverURL}`);
        ParseClient.printLog(`appKey:${app.appKey}`);
        ParseClient.printLog(`masterKey:${app.masterKey}`);
        ParseClient.printLog('=== Rx is great, Typescript is wonderful! ===');
    }

    public static printHttpLog(request?: HttpRequest, response?: HttpResponse) {
        if (request) {
            ParseClient.printLog("===HTTP-START===");
            ParseClient.printLog("===Request-START===");
            ParseClient.printLog("Url: ", request.url);
            ParseClient.printLog("Method: ", request.method);
            ParseClient.printLog("Headers: ", JSON.stringify(request.headers));
            ParseClient.printLog("RequestBody: " + JSON.stringify(request.data));
            ParseClient.printLog("===Request-END===");
        }
        if (response) {
            ParseClient.printLog("===Response-START===");
            ParseClient.printLog("StatusCode: ", response.statusCode);
            ParseClient.printLog("ResponseBody: ", response.body);
            ParseClient.printLog("===Response-END===");
            ParseClient.printLog("===HTTP-END===");
        }
    }

    public static printLog(message?: any, ...optionalParams: any[]) {
        if (ParseClient.instance.currentConfiguration.log) {
            if (optionalParams.length > 0)
                console.log(message, ...optionalParams);
            else console.log(message);
        }
    }

    protected static generateParseCommand(relativeUrl: string, method: string, data?: { [key: string]: any }, sessionToken?: string, app?: ParseApp): ParseCommand {
        let cmd = new ParseCommand({
            app: app,
            relativeUrl: relativeUrl,
            method: method,
            data: data,
            sessionToken: sessionToken
        });
        return cmd;
    }

    public rxRunCommandSuccess(relativeUrl: string, method: string, data?: { [key: string]: any }) {
        let cmd = ParseClient.generateParseCommand(relativeUrl, method, data);
        return SDKPlugins.instance.commandRunner.runRxCommand(cmd).pipe(map(res => {
            return res.statusCode == 200;
        }));
    }

    public static runCommand(relativeUrl: string, method: string, data?: { [key: string]: any }, sessionToken?: string, app?: ParseApp): Observable<{ [key: string]: any }> {
        let cmd = ParseClient.generateParseCommand(relativeUrl, method, data, sessionToken, app);
        return SDKPlugins.instance.commandRunner.runRxCommand(cmd).pipe(map(res => {
            return res.body;
        }));
    }

    private static _avClientInstance: ParseClient;

    /**
     *
     *
     * @readonly
     * @static
     * @type {ParseClient}
     * @memberof ParseClient
     */
    static get instance(): ParseClient {
        if (ParseClient._avClientInstance == null)
            ParseClient._avClientInstance = new ParseClient();
        return ParseClient._avClientInstance;
    }

    currentConfiguration: ParseClientConfig = {};
    public initialize(config: ParseClientConfig) {

        // process.on('uncaughtException', function (err) {
        //     console.error("Caught exception:", err.stack);
        // });
        // process.on('unhandledRejection', function (reason, p) {
        //     console.error("Unhandled Rejection at: Promise ", p, " reason: ", reason.stack);
        // });

        if (typeof config != 'undefined') {
            this.currentConfiguration = config;

            if (typeof (process) !== 'undefined' && process.versions && process.versions.node) {
                if (this.currentConfiguration.isNode == undefined)
                    this.currentConfiguration.isNode = true;
            }

            if (config.apps) {
                config.apps.forEach(appConfig => {
                    let app = new ParseApp(appConfig);
                    this.add(app);
                });
            }

            SDKPlugins.version = config.pluginVersion;
            if (config.plugins) {
                if (config.plugins.storage) {
                    SDKPlugins.instance.StorageProvider = config.plugins.storage;
                    SDKPlugins.instance.LocalStorageControllerInstance = new StorageController(config.plugins.storage);
                }
                if (config.plugins.websocket) {
                    SDKPlugins.instance.WebSocketProvider = config.plugins.websocket;
                }
            }
        }

        return this as ParseClient;
    }

    public request(url: string, method?: string, headers?: { [key: string]: any }, data?: { [key: string]: any }): Observable<{ [key: string]: any }> {
        let httpRequest = new HttpRequest();
        httpRequest.url = url;
        httpRequest.method = "GET";
        httpRequest.headers = {};
        if (method)
            httpRequest.method = method;
        if (data)
            httpRequest.data = data;
        if (headers)
            httpRequest.headers = headers;
        return SDKPlugins.instance.httpClient.execute(httpRequest);
    }

}

export class ParseAppConfig {
    appId: string;
    serverURL: string;
    appKey?: string;
    masterKey?: string;
    shortName?: string;
    additionalHeaders?: { [key: string]: any };
}

/**
 * 
 * 
 * @export
 * @class ParseApp
 */
export class ParseApp {

    constructor(options: ParseAppConfig) {
        this.appId = options.appId;
        this.serverURL = options.serverURL;
        this.appKey = options.appKey;
        this.masterKey = options.masterKey;
        this.shortName = options.shortName;
        this.additionalHeaders = options.additionalHeaders;
    }
    shortName: string;
    appId: string;
    appKey: string;
    serverURL: string;
    masterKey: string;
    additionalHeaders?: { [key: string]: any };

    get pureServerURL(): string {
        return this.clearTailSlashes(this.serverURL);
    }

    get mountPath(): string {
        return this.pureServerURL.replace(/^(?:\/\/|[^\/]+)*\//, "")
    }

    clearTailSlashes(url: string): string {
        if (url.endsWith('/')) {
            url = url.substring(0, url.length - 1);
            return this.clearTailSlashes(url);
        } else
            return url;
    }

    get httpHeaders() {
        let headers: { [key: string]: any } = {};
        headers = {
            'X-Parse-Application-Id': this.appId,
            'Content-Type': 'application/json;charset=utf-8'
        };
        if (this.appKey) {
            headers['X-Parse-Javascript-Key'] = this.appKey;
        }
        if (this.masterKey) {
            headers['X-Parse-Master-Key'] = this.masterKey;
        }
        if (ParseClient.instance.isNode()) {
            headers['User-Agent'] = 'ts-sdk/' + sdkInfo.version;
        }
        if (this.additionalHeaders) {
            for (let key in this.additionalHeaders) {
                headers[key] = this.additionalHeaders[key];
            }
        }
        return headers;
    }
}
