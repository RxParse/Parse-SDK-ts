import { HttpResponse } from '../../httpClient/HttpResponse';
import { ParseCommand } from '../../command/ParseCommand';
import { ParseClient } from 'public/RxParseClient';
import { Observable, from } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { IObjectState } from '../../object/state/IObjectState';
import { IUserController } from './IUserController';
import { SDKPlugins } from '../../SDKPlugins';
import { IParseCommandRunner } from '../../command/IParseCommandRunner';

export /**
 * UserController
 */
    class UserController implements IUserController {

    private readonly _commandRunner: IParseCommandRunner;
    constructor(commandRunner: IParseCommandRunner) {
        this._commandRunner = commandRunner;
    }
    signUp(state: IObjectState, dictionary: { [key: string]: any }): Observable<IObjectState> {
        let encoded = SDKPlugins.instance.Encoder.encode(dictionary);
        let cmd = new ParseCommand({
            app: state.app,
            relativeUrl: "/users",
            method: 'POST',
            data: encoded
        });
        return this._commandRunner.runRxCommand(cmd).pipe(map(res => {
            let serverState = SDKPlugins.instance.ObjectDecoder.decode(res.body, SDKPlugins.instance.Decoder);
            serverState = serverState.mutatedClone((s: IObjectState) => {
                s.isNew = true;
            });
            return serverState;
        }));
    }
    logIn(username: string, password: string): Observable<IObjectState> {
        let data = {
            "username": username,
            "password": password
        };
        let cmd = new ParseCommand({
            relativeUrl: "/login",
            method: 'POST',
            data: data
        });

        return this._commandRunner.runRxCommand(cmd).pipe(map(res => {
            let serverState = SDKPlugins.instance.ObjectDecoder.decode(res.body, SDKPlugins.instance.Decoder);
            return serverState;
        }));
    }

    logInWithParameters(relativeUrl: string, data: { [key: string]: any }): Observable<IObjectState> {
        let encoded = SDKPlugins.instance.Encoder.encode(data);

        let cmd = new ParseCommand({
            relativeUrl: relativeUrl,
            method: 'POST',
            data: data
        });

        return this._commandRunner.runRxCommand(cmd).pipe(map(res => {
            let serverState = SDKPlugins.instance.ObjectDecoder.decode(res.body, SDKPlugins.instance.Decoder);
            serverState = serverState.mutatedClone((s: IObjectState) => {
                s.isNew = res.statusCode == 201;
            });
            return serverState;
        }));
    }
    getUser(sessionToken: string): Observable<IObjectState> {
        return null;
    }
}