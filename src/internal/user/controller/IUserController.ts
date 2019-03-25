import { ParseApp } from './../../../public/ParseApp';
import { Observable } from 'rxjs';
import { IObjectState } from '../../object/state/IObjectState';

export /**
 * IUserController
 */
    interface IUserController {
    signUp(state: IObjectState, dictionary: { [key: string]: any }): Observable<IObjectState>;
    logIn(username: string, password: string): Observable<IObjectState>;
    logInWithParameters(relativeUrl: string, data: { [key: string]: any }): Observable<IObjectState>;
    getUser(sessionToken: string): Observable<IObjectState>;
    currentUser(app: ParseApp): Observable<IObjectState>;
    saveCurrentUser(app: ParseApp, userState: IObjectState): Observable<boolean>;
}