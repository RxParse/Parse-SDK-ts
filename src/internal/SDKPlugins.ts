import { HttpRequest } from './httpClient/HttpRequest';
import { IRxHttpClient } from './httpClient/IRxHttpClient';
import { RxHttpClient } from './httpClient/RxHttpClient';
import { AVCommand } from './command/AVCommand';
import { IAVCommandRunner } from './command/IAVCommandRunner';
import { AVCommandRunner } from './command/AVCommandRunner';
import { IObjectController } from './object/controller/IObjectController';
import { ObjectController } from './object/controller/ObjectController';
import { IUserController } from './user/controller/IUserController';
import { UserController } from './user/controller/UserController';
import { IQueryController } from './query/controller/IQueryController';
import { QueryController } from './query/controller/QueryController';
import { ILeanEngineController } from './LeanEngine/controller/ILeanEngineController';
import { LeanEngineController } from './LeanEngine/controller/LeanEngineController';

import { IToolController } from './tool/controller/IToolController';
import { ToolController } from './tool/controller/ToolController';

import { IAVEncoder } from './encoding/IAVEncoder';
import { AVEncoder } from './encoding/AVEncoder';
import { IAVDecoder } from './encoding/IAVDecoder';
import { AVDecoder } from './encoding/AVDecoder';
import { IAVObjectDecoder } from './encoding/IAVObjectDecoder';
import { AVObjectDecoder } from './encoding/AVObjectDecoder';
import { ILeanEngineDecoder } from './LeanEngine/encoding/ILeanEngineDecoder';
import { LeanEngineDecoder } from './LeanEngine/encoding/LeanEngineDecoder';

import { IStorage } from './storage/IStorage';
import { IStorageController } from './storage/controller/IStorageController';
import { StorageController } from './storage/controller/StorageController';

import { IDeviceInfo } from './analytics/IDeviceInfo';
import { IAnalyticsController } from './analytics/controller/IAnalyticsController';
import { AnalyticsController } from './analytics/controller/AnalyticsController';

import { IRxWebSocketClient } from './websocket/IRxWebSocketClient';
import { IWebSocketClient } from './websocket/IWebSocketClient';
import { RxWebSocketController } from './websocket/controller/RxWebSocketController';
import { IRxWebSocketController } from './websocket/controller/IRxWebSocketController';

import { RxAVClient } from '../public/RxAVClient';

export /**
 * SDKPlugins
 */
    class SDKPlugins {
    private _version = 1;
    private _HttpClient: IRxHttpClient;
    private _CommandRunner: IAVCommandRunner;
    private _ObjectController: IObjectController;
    private _QueryController: IQueryController;
    private _UserController: IUserController;
    private _LeanEngineController: ILeanEngineController;
    private _encoder: IAVEncoder;
    private _decoder: IAVDecoder;
    private _objectdecoder: IAVObjectDecoder;
    private _LeanEngineDecoder: ILeanEngineDecoder;
    private _ToolController: IToolController;
    private _StorageController: IStorageController;
    private _StorageProvider: IStorage;
    private _AnalyticsController: IAnalyticsController;
    private _DevicePorvider: IDeviceInfo;
    private _WebSocketProvider: IWebSocketClient;
    private _RxWebSocketController: IRxWebSocketController;
    private static _sdkPluginsInstance: SDKPlugins;

    constructor(version?: number) {
        this._version = version;
    }

    get HttpClient() {
        if (this._HttpClient == null) {
            this._HttpClient = new RxHttpClient(this._version);
        }
        return this._HttpClient;
    }

    get CommandRunner() {
        if (this._CommandRunner == null) {
            this._CommandRunner = new AVCommandRunner(this.HttpClient);
        }
        return this._CommandRunner;
    }

    get ObjectControllerInstance() {
        if (this._ObjectController == null) {
            this._ObjectController = new ObjectController(this.CommandRunner);
        }
        return this._ObjectController;
    }

    get UserControllerInstance() {
        if (this._UserController == null) {
            this._UserController = new UserController(this.CommandRunner);
        }
        return this._UserController;
    }

    get QueryControllerInstance() {
        if (this._QueryController == null) {
            this._QueryController = new QueryController(this.CommandRunner);
        }
        return this._QueryController;
    }

    get LeanEngineControllerInstance() {
        if (this._LeanEngineController == null) {
            this._LeanEngineController = new LeanEngineController(this.LeanEngineDecoder);
        }
        return this._LeanEngineController;
    }

    get ToolControllerInstance() {
        if (this._ToolController == null) {
            this._ToolController = new ToolController();
        }
        return this._ToolController;
    }

    get LocalStorageControllerInstance() {
        if (this._StorageController == null) {
            if (this.StorageProvider != null)
                this._StorageController = new StorageController(this.StorageProvider);
        }
        return this._StorageController;
    }

    get hasStorage() {
        return this.StorageProvider != null;
    }
    get StorageProvider() {
        return this._StorageProvider;
    }

    set StorageProvider(provider: IStorage) {
        this._StorageProvider = provider;
    }

    set LocalStorageControllerInstance(controller: IStorageController) {
        this._StorageController = controller;
    }

    get AnalyticsControllerInstance() {
        if (this._AnalyticsController == null) {
            if (this._DevicePorvider != null) {
                this._AnalyticsController = new AnalyticsController(this.CommandRunner, this._DevicePorvider);
            }
        }
        return this._AnalyticsController;
    }

    set AnalyticsControllerInstance(controller: IAnalyticsController) {
        this._AnalyticsController = controller;
    }

    get DeviceProvider() {
        return this._DevicePorvider;
    }
    set DeviceProvider(provider: IDeviceInfo) {
        this._DevicePorvider = provider;
    }

    get WebSocketProvider() {
        return this._WebSocketProvider;
    }
    set WebSocketProvider(provider: IWebSocketClient) {
        this._WebSocketProvider = provider;
    }

    get WebSocketController() {
        if (this._RxWebSocketController == null) {
            if (this._WebSocketProvider != null) {
                this._RxWebSocketController = new RxWebSocketController(this._WebSocketProvider);
            } else {
                throw new Error(`you musy set the websocket when invoke RxAVClient.init{
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
        return this._RxWebSocketController;
    }

    set WebSocketController(provider: IRxWebSocketController) {
        this._RxWebSocketController = provider;
    }

    get Encoder() {
        if (this._encoder == null) {
            this._encoder = new AVEncoder();
        }
        return this._encoder;
    }

    get Decoder() {
        if (this._decoder == null) {
            this._decoder = new AVDecoder();
        }
        return this._decoder;
    }

    get ObjectDecoder() {
        if (this._objectdecoder == null) {
            this._objectdecoder = new AVObjectDecoder();
        }
        return this._objectdecoder;
    }

    get LeanEngineDecoder() {
        if (this._LeanEngineDecoder == null) {
            this._LeanEngineDecoder = new LeanEngineDecoder(this.Decoder, this.ObjectDecoder);
        }
        return this._LeanEngineDecoder;
    }

    static get instance(): SDKPlugins {
        if (SDKPlugins._sdkPluginsInstance == null)
            SDKPlugins._sdkPluginsInstance = new SDKPlugins(1);
        return SDKPlugins._sdkPluginsInstance;
    }

    static set version(version: number) {
        SDKPlugins._sdkPluginsInstance = new SDKPlugins(version);
    }
}
