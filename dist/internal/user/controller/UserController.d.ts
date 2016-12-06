import { Observable } from '@reactivex/rxjs';
import { IObjectState } from '../../object/state/IObjectState';
import { IUserController } from './iUserController';
import { IAVCommandRunner } from '../../command/IAVCommandRunner';
export declare class UserController implements IUserController {
    private readonly _commandRunner;
    constructor(commandRunner: IAVCommandRunner);
    signUp(state: IObjectState, dictionary: {
        [key: string]: any;
    }): Observable<IObjectState>;
    logIn(username: string, password: string): Observable<IObjectState>;
    logInWithParamters(relativeUrl: string, data: {
        [key: string]: any;
    }): Observable<IObjectState>;
    getUser(sessionToken: string): Observable<IObjectState>;
}
