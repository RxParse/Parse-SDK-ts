import { ILeanEngineController } from './ILeanEngineController';
import { Observable } from '@reactivex/rxjs';
import { ILeanEngineDecoder } from '../encoding/ILeanEngineDecoder';
export declare class LeanEngineController implements ILeanEngineController {
    private _LeanEngineDecoder;
    constructor(LeanEngineDecoder: ILeanEngineDecoder);
    callFunction(name: string, parameters?: {
        [key: string]: any;
    }, sessionToken?: string): Observable<{
        [key: string]: any;
    }>;
}
