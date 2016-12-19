import { Observable } from 'rxjs';
import { ILeanEngineController } from '../internal/LeanEngine/controller/ILeanEngineController';
export declare class RxLeanEngine {
    protected static readonly LeanEngineController: ILeanEngineController;
    static callFunction(name: string, parameters?: {
        [key: string]: any;
    }): Observable<{
        [key: string]: any;
    }>;
}
