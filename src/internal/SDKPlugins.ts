import { iRxHttpClient } from './httpClient/iRxHttpClient';
import { RxHttpClient } from './httpClient/RxHttpClient';
import { iObjectController } from './object/controller/iObjectController';
import { ObjectController } from './object/controller/ObjectController';

export /**
 * SDKPlugins
 */
    class SDKPlugins {
    private _HttpClient: iRxHttpClient;
    private _ObjectController: iObjectController;

    constructor() {
    }
    
    get HttpClient() {
        if (this._HttpClient == null) {
            this._HttpClient = new RxHttpClient();
        }
        return this._HttpClient;
    }

    get ObjectControllerInstance() {
        if (this._ObjectController == null) {
            this._ObjectController = new ObjectController();
        }
        return this._ObjectController;
    }
}

export var SDKPluginsInstance: SDKPlugins = new SDKPlugins();



