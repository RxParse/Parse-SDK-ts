import { iRxHttpClient } from './httpClient/iRxHttpClient';
import { iObjectController } from './object/controller/iObjectController';
export declare class SDKPlugins {
    private _HttpClient;
    private _ObjectController;
    constructor();
    readonly HttpClient: iRxHttpClient;
    readonly ObjectControllerInstance: iObjectController;
}
export declare var SDKPluginsInstance: SDKPlugins;
