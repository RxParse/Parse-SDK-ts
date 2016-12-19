import { SDKPlugins } from '../internal/SDKPlugins';
import { Observable } from 'rxjs';
import { ILeanEngineController } from '../internal/LeanEngine/controller/ILeanEngineController';
import { RxAVUser } from '../RxLeanCloud';

export class RxLeanEngine {

    protected static get LeanEngineController() {
        return SDKPlugins.instance.LeanEngineControllerInstance;
    }

    static callFunction(name: string, parameters?: { [key: string]: any }) {
        return RxLeanEngine.LeanEngineController.callFunction(name,parameters,RxAVUser.currentSessionToken);
    }
}