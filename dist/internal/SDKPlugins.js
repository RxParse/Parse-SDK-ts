"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const RxHttpClient_1 = require("./httpClient/RxHttpClient");
const AVCommandRunner_1 = require("./command/AVCommandRunner");
const ObjectController_1 = require("./object/controller/ObjectController");
const UserController_1 = require("./user/controller/UserController");
const QueryController_1 = require("./query/controller/QueryController");
const LeanEngineController_1 = require("./LeanEngine/controller/LeanEngineController");
const ToolController_1 = require("./tool/controller/ToolController");
const AVEncoder_1 = require("./encoding/AVEncoder");
const AVDecoder_1 = require("./encoding/AVDecoder");
const AVObjectDecoder_1 = require("./encoding/AVObjectDecoder");
const LeanEngineDecoder_1 = require("./LeanEngine/encoding/LeanEngineDecoder");
const StorageController_1 = require("./storage/controller/StorageController");
const AnalyticsController_1 = require("./analytics/controller/AnalyticsController");
const RxWebSocketController_1 = require("./websocket/controller/RxWebSocketController");
class SDKPlugins {
    constructor(version) {
        this._version = 1;
        this._version = version;
    }
    get HttpClient() {
        if (this._HttpClient == null) {
            this._HttpClient = new RxHttpClient_1.RxHttpClient(this._version);
        }
        return this._HttpClient;
    }
    get CommandRunner() {
        if (this._CommandRunner == null) {
            this._CommandRunner = new AVCommandRunner_1.AVCommandRunner(this.HttpClient);
        }
        return this._CommandRunner;
    }
    get ObjectControllerInstance() {
        if (this._ObjectController == null) {
            this._ObjectController = new ObjectController_1.ObjectController(this.CommandRunner);
        }
        return this._ObjectController;
    }
    get UserControllerInstance() {
        if (this._UserController == null) {
            this._UserController = new UserController_1.UserController(this.CommandRunner);
        }
        return this._UserController;
    }
    get QueryControllerInstance() {
        if (this._QueryController == null) {
            this._QueryController = new QueryController_1.QueryController(this.CommandRunner);
        }
        return this._QueryController;
    }
    get LeanEngineControllerInstance() {
        if (this._LeanEngineController == null) {
            this._LeanEngineController = new LeanEngineController_1.LeanEngineController(this.LeanEngineDecoder);
        }
        return this._LeanEngineController;
    }
    get ToolControllerInstance() {
        if (this._ToolController == null) {
            this._ToolController = new ToolController_1.ToolController();
        }
        return this._ToolController;
    }
    get LocalStorageControllerInstance() {
        if (this._StorageController == null) {
            if (this.StorageProvider != null)
                this._StorageController = new StorageController_1.StorageController(this.StorageProvider);
        }
        return this._StorageController;
    }
    get hasStorage() {
        return this.StorageProvider != null;
    }
    get StorageProvider() {
        return this._StorageProvider;
    }
    set StorageProvider(provider) {
        this._StorageProvider = provider;
    }
    set LocalStorageControllerInstance(controller) {
        this._StorageController = controller;
    }
    get AnalyticsControllerInstance() {
        if (this._AnalyticsController == null) {
            if (this._DevicePorvider != null) {
                this._AnalyticsController = new AnalyticsController_1.AnalyticsController(this.CommandRunner, this._DevicePorvider);
            }
        }
        return this._AnalyticsController;
    }
    set AnalyticsControllerInstance(controller) {
        this._AnalyticsController = controller;
    }
    get DeviceProvider() {
        return this._DevicePorvider;
    }
    set DeviceProvider(provider) {
        this._DevicePorvider = provider;
    }
    get WebSocketProvider() {
        return this._WebSocketProvider;
    }
    set WebSocketProvider(provider) {
        this._WebSocketProvider = provider;
    }
    get WebSocketController() {
        if (this._RxWebSocketController == null) {
            if (this._WebSocketProvider != null) {
                this._RxWebSocketController = new RxWebSocketController_1.RxWebSocketController(this._WebSocketProvider);
            }
            else {
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
    set WebSocketController(provider) {
        this._RxWebSocketController = provider;
    }
    get Encoder() {
        if (this._encoder == null) {
            this._encoder = new AVEncoder_1.AVEncoder();
        }
        return this._encoder;
    }
    get Decoder() {
        if (this._decoder == null) {
            this._decoder = new AVDecoder_1.AVDecoder();
        }
        return this._decoder;
    }
    get ObjectDecoder() {
        if (this._objectdecoder == null) {
            this._objectdecoder = new AVObjectDecoder_1.AVObjectDecoder();
        }
        return this._objectdecoder;
    }
    get LeanEngineDecoder() {
        if (this._LeanEngineDecoder == null) {
            this._LeanEngineDecoder = new LeanEngineDecoder_1.LeanEngineDecoder(this.Decoder, this.ObjectDecoder);
        }
        return this._LeanEngineDecoder;
    }
    static get instance() {
        if (SDKPlugins._sdkPluginsInstance == null)
            SDKPlugins._sdkPluginsInstance = new SDKPlugins(1);
        return SDKPlugins._sdkPluginsInstance;
    }
    static set version(version) {
        SDKPlugins._sdkPluginsInstance = new SDKPlugins(version);
    }
}
exports.SDKPlugins = SDKPlugins;
