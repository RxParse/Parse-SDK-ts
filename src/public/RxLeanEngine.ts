import { SDKPlugins } from '../internal/SDKPlugins';
import { Observable } from 'rxjs';
import { ILeanEngineController } from '../internal/LeanEngine/controller/ILeanEngineController';
import { RxParseUser, ParseApp } from 'RxParse';

export class RxParseCloud {

    protected static get LeanEngineController() {
        return SDKPlugins.instance.LeanEngineControllerInstance;
    }

    /**
     * 调用云函数
     * 
     * @static
     * @param {string} name 云函数 name
     * @param {Object} [parameters] 参数字典:{{ [key: string]: any }} 
     * @returns {Observable<Object>}
     * 
     * @memberOf RxLeanEngine
     */
    static run(name: string, parameters?: { [key: string]: any }, app?: ParseApp) {
        return RxParseUser.currentSessionToken().flatMap(sessionToken => {
            return RxParseCloud.LeanEngineController.callFunction(name, parameters, sessionToken);
        });
    }
}