import { HttpResponse } from '../../httpClient/HttpResponse';
import { AVCommand } from '../../command/AVCommand';
import { RxParseClient } from '../../../public/RxAVClient';
import { Observable } from 'rxjs';
import { IObjectState } from '../../object/state/IObjectState';
import { IUserController } from './IUserController';
import { SDKPlugins } from '../../SDKPlugins';
import { IAVCommandRunner } from '../../command/IAVCommandRunner';

export /**
 * UserController
 */
    class UserController implements IUserController {

    private readonly _commandRunner: IAVCommandRunner;
    constructor(commandRunner: IAVCommandRunner) {
        this._commandRunner = commandRunner;
    }
    signUp(state: IObjectState, dictionary: { [key: string]: any }): Observable<IObjectState> {
        let encoded = SDKPlugins.instance.Encoder.encode(dictionary);
        let cmd = new AVCommand({
            app: state.app,
            relativeUrl: "/users",
            method: 'POST',
            data: encoded
        });
        return this._commandRunner.runRxCommand(cmd).map(res => {
            let serverState = SDKPlugins.instance.ObjectDecoder.decode(res.body, SDKPlugins.instance.Decoder);
            serverState = serverState.mutatedClone((s: IObjectState) => {
                s.isNew = true;
            });
            return serverState;
        });
    }
    logIn(username: string, password: string): Observable<IObjectState> {
        let data = {
            "username": username,
            "password": password
        };
        let cmd = new AVCommand({
            relativeUrl: "/login",
            method: 'POST',
            data: data
        });

        return this._commandRunner.runRxCommand(cmd).map(res => {
            let serverState = SDKPlugins.instance.ObjectDecoder.decode(res.body, SDKPlugins.instance.Decoder);
            return serverState;
        });
    }
    logInWithParamters(relativeUrl: string, data: { [key: string]: any }): Observable<IObjectState> {
        let encoded = SDKPlugins.instance.Encoder.encode(data);

        let cmd = new AVCommand({
            relativeUrl: relativeUrl,
            method: 'POST',
            data: data
        });

        return this._commandRunner.runRxCommand(cmd).map(res => {
            let serverState = SDKPlugins.instance.ObjectDecoder.decode(res.body, SDKPlugins.instance.Decoder);
            serverState = serverState.mutatedClone((s: IObjectState) => {
                s.isNew = res.statusCode == 201;
            });
            return serverState;
        });
    }
    getUser(sessionToken: string): Observable<IObjectState> {
        return null;
    }
}