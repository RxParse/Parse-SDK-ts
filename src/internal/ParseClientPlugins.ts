import { AxiosRxHttpClient } from './httpClient/AxiosRxHttpClient';
import { IRxHttpClient } from './httpClient/IRxHttpClient';
import { IParseCommandRunner } from './command/IParseCommandRunner';
import { ParseCommandRunner } from './command/ParseCommandRunner';
import { IObjectController } from './object/controller/IParseObjectController';
import { ObjectController } from './object/controller/ParseObjectController';
import { IUserController } from './user/controller/IUserController';
import { UserController } from './user/controller/UserController';
import { IQueryController } from './query/controller/IQueryController';
import { QueryController } from './query/controller/QueryController';
import { IParseCloudController } from './cloud/controller/IParseCloudController';
import { ParseCloudController } from './cloud/controller/ParseCloudController';

import { IToolController } from './tool/controller/IToolController';
import { ToolController } from './tool/controller/ToolController';
import { ILogController } from './tool/controller/ILogController';
import { LogController } from './tool/controller/LogController';

import { IParseEncoder } from './encoding/IParseEncoder';
import { ParseEncoder } from './encoding/ParseEncoder';
import { IParseDecoder } from './encoding/IParseDecoder';
import { ParseDecoder } from './encoding/ParseDecoder';
import { IParseObjectDecoder } from './encoding/IParseObjectDecoder';
import { ParseObjectDecoder } from './encoding/ParseObjectDecoder';
import { IParseCloudDecoder } from './cloud/encoding/IParseCloudDecoder';
import { ParseCloudDecoder } from './cloud/encoding/ParseCloudDecoder';

import { IStorage } from './storage/IStorage';
import { IStorageController } from './storage/controller/IStorageController';
import { StorageController } from './storage/controller/StorageController';

import { IWebSocketClient } from './websocket/IWebSocketClient';
import { RxWebSocketController } from './websocket/controller/RxWebSocketController';
import { IRxWebSocketController } from './websocket/controller/IRxWebSocketController';
import { HttpRequest } from './httpClient/HttpRequest';
import { Observable } from 'rxjs';

export /**
 * SDKPlugins
 */
    class ParseClientPlugins {
    private _version = 1;
    private _httpClient: IRxHttpClient;
    private _commandRunner: IParseCommandRunner;
    private _objectController: IObjectController;
    private _queryController: IQueryController;
    private _userController: IUserController;
    private _cloudController: IParseCloudController;
    private _encoder: IParseEncoder;
    private _decoder: IParseDecoder;
    private _objectDecoder: IParseObjectDecoder;
    private _cloudDecoder: IParseCloudDecoder;
    private _toolController: IToolController;
    private _logger: ILogController;
    private _storageController: IStorageController;
    private _storageProvider: IStorage;
    private _webSocketProvider: IWebSocketClient;
    private _rxWebSocketController: IRxWebSocketController;
    private static _sdkPluginsInstance: ParseClientPlugins;

    constructor(version?: number) {
        this._version = version;
    }

    get ToolControllerInstance() {
        if (this._toolController == null) {
            this._toolController = new ToolController();
        }
        return this._toolController;
    }

    get logger(): ILogController {
        if (this._logger == null) {
            this._logger = new LogController();
        }
        return this._logger;
    }

    get LocalStorageControllerInstance() {
        if (this._storageController == null) {
            if (this.StorageProvider != null)
                this._storageController = new StorageController(this.StorageProvider);
        }
        return this._storageController;
    }

    get hasStorage() {
        return this.StorageProvider != null;
    }

    get StorageProvider() {
        return this._storageProvider;
    }

    set StorageProvider(provider: IStorage) {
        this._storageProvider = provider;
    }

    set LocalStorageControllerInstance(controller: IStorageController) {
        this._storageController = controller;
    }

    get httpClient() {
        if (this._httpClient == null) {
            this._httpClient = new AxiosRxHttpClient();
        }
        return this._httpClient;
    }

    get commandRunner() {
        if (this._commandRunner == null) {
            this._commandRunner = new ParseCommandRunner(this.httpClient, this.logger);
        }
        return this._commandRunner;
    }

    get objectController() {
        if (this._objectController == null) {
            this._objectController = new ObjectController(this.commandRunner);
        }
        return this._objectController;
    }

    get queryController() {
        if (this._queryController == null) {
            this._queryController = new QueryController(this.commandRunner);
        }
        return this._queryController;
    }

    get cloudController() {
        if (this._cloudController == null) {
            this._cloudController = new ParseCloudController(this.CloudDecoder);
        }
        return this._cloudController;
    }

    get WebSocketProvider() {
        return this._webSocketProvider;
    }

    set WebSocketProvider(provider: IWebSocketClient) {
        this._webSocketProvider = provider;
    }

    get WebSocketController() {
        if (this._rxWebSocketController == null) {
            if (this._webSocketProvider != null) {
                this._rxWebSocketController = new RxWebSocketController(this._webSocketProvider);
            } else {
                throw new Error(`you must set the websocket when invoke RxParseClient.init{
                    ...
                    plugins?: {
                        ...
                        websocket?: IWebSocketClient
                        ...
                    }
                    ...
                    }`);
            }
        }
        return this._rxWebSocketController;
    }

    set WebSocketController(provider: IRxWebSocketController) {
        this._rxWebSocketController = provider;
    }

    get Encoder() {
        if (this._encoder == null) {
            this._encoder = new ParseEncoder();
        }
        return this._encoder;
    }

    get Decoder() {
        if (this._decoder == null) {
            this._decoder = new ParseDecoder();
        }
        return this._decoder;
    }

    get ObjectDecoder() {
        if (this._objectDecoder == null) {
            this._objectDecoder = new ParseObjectDecoder();
        }
        return this._objectDecoder;
    }

    get CloudDecoder() {
        if (this._cloudDecoder == null) {
            this._cloudDecoder = new ParseCloudDecoder(this.Decoder, this.ObjectDecoder);
        }
        return this._cloudDecoder;
    }

    get userController() {
        if (this._userController == null) {
            this._userController = new UserController(this.commandRunner, this.LocalStorageControllerInstance);
        }
        return this._userController;
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
        return ParseClientPlugins.instance.httpClient.execute(httpRequest);
    }

    static get instance(): ParseClientPlugins {
        if (ParseClientPlugins._sdkPluginsInstance == null)
            ParseClientPlugins._sdkPluginsInstance = new ParseClientPlugins(1);
        return ParseClientPlugins._sdkPluginsInstance;
    }

    static set version(version: number) {
        ParseClientPlugins._sdkPluginsInstance = new ParseClientPlugins(version);
    }

}
