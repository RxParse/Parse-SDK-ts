import { Observable } from 'rxjs';

export interface ILeanEngineController {
    callFunction(name: string,
        parameters?: { [key: string]: any },
        sessionToken?: string): Observable<{ [key: string]: any }>;
}