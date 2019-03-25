import { ParseClientPlugins } from '../internal/ParseClientPlugins';
import { ParseCommand } from '../internal/command/ParseCommand';
import { IStorage } from '../internal/storage/IStorage';
import { IWebSocketClient } from '../internal/websocket/IWebSocketClient';
import { StorageController } from '../internal/storage/controller/StorageController';
import { Observable } from 'rxjs';
import { map, flatMap } from 'rxjs/operators';
import { HttpRequest } from '../internal/httpClient/HttpRequest';
import { HttpResponse } from '../internal/httpClient/HttpResponse';
import { RxParseObject } from './RxParseObject'
import { RxParseRole } from './RxParseRole';
import { RxParseUser } from './RxParseUser';
import { ParseApp, ParseAppConfig } from './ParseApp';

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
        return ParseClientPlugins.instance.commandRunner.runRxCommand(cmd).pipe(map(res => {
            return res.statusCode == 200 || res.statusCode == 201;
        }));
    }

    public static runCommand(relativeUrl: string, method: string, data?: { [key: string]: any }, sessionToken?: string, app?: ParseApp): Observable<{ [key: string]: any }> {
        let cmd = ParseClient.generateParseCommand(relativeUrl, method, data, sessionToken, app);
        return ParseClientPlugins.instance.commandRunner.runRxCommand(cmd).pipe(map(res => {
            return res.body;
        }));
    }

    private static _parseClientInstance: ParseClient;

    /**
     *
     *
     * @readonly
     * @static
     * @type {ParseClient}
     * @memberof ParseClient
     */
    static get instance(): ParseClient {
        if (ParseClient._parseClientInstance == null)
            ParseClient._parseClientInstance = new ParseClient();
        return ParseClient._parseClientInstance;
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

            RxParseObject.registerSubclass<RxParseUser>("_User", RxParseUser);
            RxParseObject.registerSubclass<RxParseRole>("_Role", RxParseRole);
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

            ParseClientPlugins.version = config.pluginVersion;
            if (config.plugins) {
                if (config.plugins.storage) {
                    ParseClientPlugins.instance.StorageProvider = config.plugins.storage;
                    ParseClientPlugins.instance.LocalStorageControllerInstance = new StorageController(config.plugins.storage);
                }
                if (config.plugins.websocket) {
                    ParseClientPlugins.instance.WebSocketProvider = config.plugins.websocket;
                }
            }
        }

        return this as ParseClient;
    }
}

