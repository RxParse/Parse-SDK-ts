import { Observable } from 'rxjs';

export interface IParseCloudController {
    callFunction(name: string,
        parameters?: { [key: string]: any },
        sessionToken?: string): Observable<{ [key: string]: any }>;
}