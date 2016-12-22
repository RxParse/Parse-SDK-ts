import { Observable } from 'rxjs';
import { ILeanEngineController } from '../internal/LeanEngine/controller/ILeanEngineController';
export declare class RxLeanEngine {
    protected static readonly LeanEngineController: ILeanEngineController;
    /**
     * 调用云函数
     *
     * @static
     * @param {string} name 云函数 name
     * @param {{ [key: string]: any }} [parameters] 参数字典
     * @returns
     *
     * @memberOf RxLeanEngine
     */
    static callFunction(name: string, parameters?: {
        [key: string]: any;
    }): Observable<{
        [key: string]: any;
    }>;
}
