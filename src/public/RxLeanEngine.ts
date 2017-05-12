import { SDKPlugins } from '../internal/SDKPlugins';
import { Observable } from 'rxjs';
import { ILeanEngineController } from '../internal/LeanEngine/controller/ILeanEngineController';
import { RxAVUser, RxAVApp } from '../RxLeanCloud';

export class RxLeanEngine {

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
    static callFunction(name: string, parameters?: { [key: string]: any }, app?: RxAVApp) {
        return RxAVUser.currentSessionToken().flatMap(sessionToken => {
            return RxLeanEngine.LeanEngineController.callFunction(name, parameters, sessionToken);
        });

    }
}