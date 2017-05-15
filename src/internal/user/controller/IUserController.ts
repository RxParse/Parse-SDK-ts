import { Observable } from 'rxjs';
import { IObjectState } from '../../object/state/IObjectState';

export /**
 * IUserController
 */
    interface IUserController {
    signUp(state:IObjectState,dictionary:{ [key: string]: any }): Observable<IObjectState>;
    logIn(username: string, password: string): Observable<IObjectState>;
    logInWithParamters(relativeUrl: string, data: { [key: string]: any }): Observable<IObjectState>;
    getUser(sessionToken:string): Observable<IObjectState>;
}