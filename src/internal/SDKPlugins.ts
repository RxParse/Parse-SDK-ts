import { HttpRequest } from './httpClient/HttpRequest';
import { IRxHttpClient } from './httpClient/iRxHttpClient';
import { RxHttpClient } from './httpClient/RxHttpClient';
import { AVCommand } from './command/AVCommand';
import { IAVCommandRunner } from './command/IAVCommandRunner';
import { AVCommandRunner } from './command/AVCommandRunner';
import { iObjectController } from './object/controller/iObjectController';
import { ObjectController } from './object/controller/ObjectController';
import { IUserController } from './user/controller/iUserController';
import { UserController } from './user/controller/UserController';
import { ILeanEngineController } from './LeanEngine/controller/ILeanEngineController';
import { LeanEngineController } from './LeanEngine/controller/LeanEngineController';

import { IAVEncoder } from './encoding/IAVEncoder';
import { AVEncoder } from './encoding/AVEncoder';
import { IAVDecoder } from './encoding/IAVDecoder';
import { AVDecoder } from './encoding/AVDecoder';
import { IAVObjectDecoder } from './encoding/IAVObjectDecoder';
import { AVObjectDecoder } from './encoding/AVObjectDecoder';
import { ILeanEngineDecoder } from './LeanEngine/encoding/ILeanEngineDecoder';
import { LeanEngineDecoder } from './LeanEngine/encoding/LeanEngineDecoder';

import { RxAVClient } from '../public/RxAVClient';

export /**
 * SDKPlugins
 */
    class SDKPlugins {
    private _version = 1;
    private _HttpClient: IRxHttpClient;
    private _CommandRunner: IAVCommandRunner;
    private _ObjectController: iObjectController;
    private _UserController: IUserController;
    private _LeanEngineController: ILeanEngineController;
    private _encoder: IAVEncoder;
    private _decoder: IAVDecoder;
    private _objectdecoder: IAVObjectDecoder;
    private _LeanEngineDecoder:ILeanEngineDecoder;
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
    get LeanEngineControllerInstance() {
        if (this._LeanEngineController == null) {
            this._LeanEngineController = new LeanEngineController(this.LeanEngineDecoder);
        }
        return this._LeanEngineController;
    }
    generateAVCommand(relativeUrl: string, method: string, data: { [key: string]: any }): HttpRequest {
        let request: HttpRequest = new HttpRequest();
        request.method = method;
        let encodeData = SDKPlugins.instance.Encoder.encode(data);
        request.data = encodeData;
        request.url = RxAVClient.serverUrl() + relativeUrl;
        request.headers = RxAVClient.headers();
        return request;
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
    get LeanEngineDecoder(){
        if (this._LeanEngineDecoder == null) {
            this._LeanEngineDecoder = new LeanEngineDecoder(this.Decoder,this.ObjectDecoder);
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


