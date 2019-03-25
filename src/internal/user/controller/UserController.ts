import { ParseApp } from './../../../public/ParseApp';
import { ParseCommand } from '../../command/ParseCommand';
import { Observable, from } from 'rxjs';
import { map } from 'rxjs/operators';
import { IObjectState } from '../../object/state/IObjectState';
import { IUserController } from './IUserController';
import { ParseClientPlugins } from '../../ParseClientPlugins';
import { IParseCommandRunner } from '../../command/IParseCommandRunner';
import { IStorageController } from '../../storage/controller/IStorageController';

export /**
 * UserController
 */
    class UserController implements IUserController {

    private readonly _commandRunner: IParseCommandRunner;
    private readonly _storageController: IStorageController;
    constructor(commandRunner: IParseCommandRunner, storageController: IStorageController) {
        this._commandRunner = commandRunner;
        this._storageController = storageController;
    }
    signUp(state: IObjectState, dictionary: { [key: string]: any }): Observable<IObjectState> {
        let encoded = ParseClientPlugins.instance.Encoder.encode(dictionary);
        let cmd = new ParseCommand({
            app: state.app,
            relativeUrl: "/users",
            method: 'POST',
            data: encoded
        });
        return this._commandRunner.runRxCommand(cmd).pipe(map(res => {
            let serverState = ParseClientPlugins.instance.ObjectDecoder.decode(res.body, ParseClientPlugins.instance.Decoder);
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
            let serverState = ParseClientPlugins.instance.ObjectDecoder.decode(res.body, ParseClientPlugins.instance.Decoder);
            return serverState;
        }));
    }

    logInWithParameters(relativeUrl: string, data: { [key: string]: any }): Observable<IObjectState> {
        let encoded = ParseClientPlugins.instance.Encoder.encode(data);

        let cmd = new ParseCommand({
            relativeUrl: relativeUrl,
            method: 'POST',
            data: data
        });

        return this._commandRunner.runRxCommand(cmd).pipe(map(res => {
            let serverState = ParseClientPlugins.instance.ObjectDecoder.decode(res.body, ParseClientPlugins.instance.Decoder);
            serverState = serverState.mutatedClone((s: IObjectState) => {
                s.isNew = res.statusCode == 201;
            });
            return serverState;
        }));
    }
    getUser(sessionToken: string): Observable<IObjectState> {
        return null;
    }
    static readonly currentUserCacheKey = 'CurrentUser';
    static usersMap: Map<string, IObjectState> = new Map<string, IObjectState>();
    currentUser(app: ParseApp): Observable<IObjectState> {
        let rtn: IObjectState = null;
        if (UserController.usersMap.has(app.appId)) {
            rtn = UserController.usersMap.get(app.appId);
        } else if (this._storageController) {
            return this._storageController.get(`${app.appId}_${UserController.currentUserCacheKey}`).pipe(map(userCache => {
                if (userCache) {
                    let userState = ParseClientPlugins.instance.ObjectDecoder.decode(userCache, ParseClientPlugins.instance.Decoder);
                    rtn = userState;
                }
                return rtn;
            }));
        }
        return from([rtn]);
    }

    saveCurrentUser(app: ParseApp, userState: IObjectState) {
        UserController.usersMap.set(userState.app.appId, userState);
        let data = userState.serverData;
        data['objectId'] = userState.objectId;
        data['createdAt'] = userState.createdAt;
        data['updatedAt'] = userState.updatedAt;
        let encoded = ParseClientPlugins.instance.Encoder.encode(data);
        var key = `${app.appId}_${UserController.currentUserCacheKey}`;
        if (ParseClientPlugins.instance.hasStorage) {
            if (encoded == null) {
                return this._storageController.remove(key).pipe(map(provider => {
                    return provider != null;
                }));
            } else {
                return this._storageController.set(key, encoded).pipe(map(provider => {
                    return provider != null;
                }));
            }
        } else {
            return from([true]);
        }
    }
}