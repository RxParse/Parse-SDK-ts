"use strict";
var HttpRequest_1 = require('./httpClient/HttpRequest');
var RxHttpClient_1 = require('./httpClient/RxHttpClient');
var AVCommandRunner_1 = require('./command/AVCommandRunner');
var ObjectController_1 = require('./object/controller/ObjectController');
var UserController_1 = require('./user/controller/UserController');
var QueryController_1 = require('./query/controller/QueryController');
var LeanEngineController_1 = require('./LeanEngine/controller/LeanEngineController');
var ToolController_1 = require('./tool/controller/ToolController');
var AVEncoder_1 = require('./encoding/AVEncoder');
var AVDecoder_1 = require('./encoding/AVDecoder');
var AVObjectDecoder_1 = require('./encoding/AVObjectDecoder');
var LeanEngineDecoder_1 = require('./LeanEngine/encoding/LeanEngineDecoder');
var StorageController_1 = require('./storage/controller/StorageController');
var AnalyticsController_1 = require('./analytics/controller/AnalyticsController');
var RxAVClient_1 = require('../public/RxAVClient');
var SDKPlugins = (function () {
    function SDKPlugins(version) {
        this._version = 1;
        this._version = version;
    }
    Object.defineProperty(SDKPlugins.prototype, "HttpClient", {
        get: function () {
            if (this._HttpClient == null) {
                this._HttpClient = new RxHttpClient_1.RxHttpClient(this._version);
            }
            return this._HttpClient;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SDKPlugins.prototype, "CommandRunner", {
        get: function () {
            if (this._CommandRunner == null) {
                this._CommandRunner = new AVCommandRunner_1.AVCommandRunner(this.HttpClient);
            }
            return this._CommandRunner;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SDKPlugins.prototype, "ObjectControllerInstance", {
        get: function () {
            if (this._ObjectController == null) {
                this._ObjectController = new ObjectController_1.ObjectController(this.CommandRunner);
            }
            return this._ObjectController;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SDKPlugins.prototype, "UserControllerInstance", {
        get: function () {
            if (this._UserController == null) {
                this._UserController = new UserController_1.UserController(this.CommandRunner);
            }
            return this._UserController;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SDKPlugins.prototype, "QueryControllerInstance", {
        get: function () {
            if (this._QueryController == null) {
                this._QueryController = new QueryController_1.QueryController(this.CommandRunner);
            }
            return this._QueryController;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SDKPlugins.prototype, "LeanEngineControllerInstance", {
        get: function () {
            if (this._LeanEngineController == null) {
                this._LeanEngineController = new LeanEngineController_1.LeanEngineController(this.LeanEngineDecoder);
            }
            return this._LeanEngineController;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SDKPlugins.prototype, "ToolControllerInstance", {
        get: function () {
            if (this._ToolController == null) {
                this._ToolController = new ToolController_1.ToolController();
            }
            return this._ToolController;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SDKPlugins.prototype, "LocalStorageControllerInstance", {
        get: function () {
            if (this._StorageController == null) {
                if (this.StorageProvider != null)
                    this._StorageController = new StorageController_1.StorageController(this.StorageProvider);
            }
            return this._StorageController;
        },
        set: function (controller) {
            this._StorageController = controller;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SDKPlugins.prototype, "hasStorage", {
        get: function () {
            return this.StorageProvider != null;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SDKPlugins.prototype, "AnalyticsControllerInstance", {
        get: function () {
            if (this._AnalyticsController == null) {
                if (this._DevicePorvider != null) {
                    this._AnalyticsController = new AnalyticsController_1.AnalyticsController(this.CommandRunner, this._DevicePorvider);
                }
            }
            return this._AnalyticsController;
        },
        set: function (controller) {
            this._AnalyticsController = controller;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SDKPlugins.prototype, "StorageProvider", {
        get: function () {
            return this._StorageProvider;
        },
        set: function (provider) {
            this._StorageProvider = provider;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SDKPlugins.prototype, "DeviceProvider", {
        get: function () {
            return this._DevicePorvider;
        },
        set: function (provider) {
            this._DevicePorvider = provider;
        },
        enumerable: true,
        configurable: true
    });
    SDKPlugins.prototype.generateAVCommand = function (relativeUrl, method, data) {
        var request = new HttpRequest_1.HttpRequest();
        request.method = method;
        var encodeData = SDKPlugins.instance.Encoder.encode(data);
        request.data = encodeData;
        request.url = RxAVClient_1.RxAVClient.serverUrl() + relativeUrl;
        request.headers = RxAVClient_1.RxAVClient.headers();
        return request;
    };
    Object.defineProperty(SDKPlugins.prototype, "Encoder", {
        get: function () {
            if (this._encoder == null) {
                this._encoder = new AVEncoder_1.AVEncoder();
            }
            return this._encoder;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SDKPlugins.prototype, "Decoder", {
        get: function () {
            if (this._decoder == null) {
                this._decoder = new AVDecoder_1.AVDecoder();
            }
            return this._decoder;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SDKPlugins.prototype, "ObjectDecoder", {
        get: function () {
            if (this._objectdecoder == null) {
                this._objectdecoder = new AVObjectDecoder_1.AVObjectDecoder();
            }
            return this._objectdecoder;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SDKPlugins.prototype, "LeanEngineDecoder", {
        get: function () {
            if (this._LeanEngineDecoder == null) {
                this._LeanEngineDecoder = new LeanEngineDecoder_1.LeanEngineDecoder(this.Decoder, this.ObjectDecoder);
            }
            return this._LeanEngineDecoder;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SDKPlugins, "instance", {
        get: function () {
            if (SDKPlugins._sdkPluginsInstance == null)
                SDKPlugins._sdkPluginsInstance = new SDKPlugins(1);
            return SDKPlugins._sdkPluginsInstance;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SDKPlugins, "version", {
        set: function (version) {
            SDKPlugins._sdkPluginsInstance = new SDKPlugins(version);
        },
        enumerable: true,
        configurable: true
    });
    return SDKPlugins;
}());
exports.SDKPlugins = SDKPlugins;
