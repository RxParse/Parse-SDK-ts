import { iRxHttpClient } from './httpClient/iRxHttpClient';
import { RxHttpClient } from './httpClient/RxHttpClient';
import { iObjectController } from './object/controller/iObjectController';
import { ObjectController } from './object/controller/ObjectController';

export /**
 * SDKPlugins
 */
    class SDKPlugins {
    private _version = 1;
    private _HttpClient: iRxHttpClient;
    private _ObjectController: iObjectController;
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

    get ObjectControllerInstance() {
        if (this._ObjectController == null) {
            this._ObjectController = new ObjectController();
        }
        return this._ObjectController;
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




