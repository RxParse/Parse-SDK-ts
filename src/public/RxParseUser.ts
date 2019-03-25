import { ParseApp } from './ParseApp';
import { ParseClientPlugins } from '../internal/ParseClientPlugins';
import { RxParseRole } from './RxParseRole';
import { ParseClient } from './RxParseClient';
import { RxParseObject } from './RxParseObject';
import { RxParseInstallation } from './RxParseInstallation';
import { RxParseQuery } from './RxParseQuery';
import { IObjectState } from '../internal/object/state/IObjectState';
import { IUserController } from '../internal/user/controller/IUserController';
import { flatMap, map, filter } from 'rxjs/operators';
import { Observable, from } from 'rxjs';

/**
 *
 *
 * @export
 * @class RxParseUser
 * @extends {RxParseObject}
 */
export class RxParseUser extends RxParseObject {
    constructor() {
        super('_User');
    }
    static readonly installationKey = 'installations';
    static readonly currentUserCacheKey = 'CurrentUser';
    private _username: string;
    email: string;
    private _mobilePhone: string;
    roles: Array<RxParseRole>;

    static usersMap: Map<string, RxParseUser> = new Map<string, RxParseUser>();
    protected static saveCurrentUser(user: RxParseUser) {

        RxParseUser.usersMap.set(user.state.app.appId, user);
        console.log('jsonToSaved', user.toJSONObjectForSaving());
        return RxParseObject.saveToLocalStorage(user, `${user.state.app.appId}_${RxParseUser.currentUserCacheKey}`);
    }


    /**
     *
     *
     * @static
     * @param {*} [options]
     * @returns {Observable<RxParseUser>}
     * @memberof RxParseUser
     */
    static current(options?: any): Observable<RxParseUser> {
        let rtn: RxParseUser = null;
        let app: ParseApp = options.app;
        return this.UserController.currentUser(app).pipe(map(cacheState => {
            let userState = ParseClientPlugins.instance.ObjectDecoder.decode(cacheState, ParseClientPlugins.instance.Decoder);
            userState = userState.mutatedClone((s: IObjectState) => { });
            let user = RxParseUser.createWithoutData();
            user.handlerLogIn(userState);
            rtn = user;
            return rtn;
        }));
    }

    static currentSessionToken(): Observable<string> {
        return RxParseUser.current().pipe(map(user => {
            if (user != null)
                return user.sessionToken as string;
            return null;
        }));
    }

    protected static get UserController(): IUserController {
        return ParseClientPlugins.instance.userController;
    }

    /**
     *
     *
     * @memberof RxParseUser
     */
    set username(username: string) {
        if (this.sessionToken == null) {
            this._username = username;
            this.set('username', this._username);
        }
        else {
            throw new Error('can not reset username.');
        }
    }

    /**
     *
     *
     * @memberof RxParseUser
     */
    get username() {
        this._username = this.getProperty('username');
        return this._username;
    }

    /**
     *
     *
     * @memberof RxParseUser
     */
    get mobilePhone() {
        this._mobilePhone = this.getProperty('mobilePhoneNumber');
        return this._mobilePhone;
    }

    /**
     *
     *
     * @memberof RxParseUser
     */
    set mobilePhone(mobile: string) {
        if (this.sessionToken == null) {
            this._mobilePhone = mobile;
            this.set('mobilePhoneNumber', this._mobilePhone);
        }
        else {
            throw new Error('can not reset mobilePhone.');
        }
    }

    /**
     *
     *
     * @memberof RxParseUser
     */
    set password(password: string) {
        if (this.sessionToken == null)
            this.set('password', password);
        else {
            throw new Error('can not set password for a exist user, if you want to reset password, please call requestResetPassword.');
        }
    }

    get sessionToken() {
        return this.getProperty('sessionToken');
    }

    public isAuthenticated(): Observable<boolean> {
        try {
            return !!this.sessionToken && ParseClient.runCommand('/users/me', 'GET', null, this.sessionToken, this.state.app).pipe(map(body => {
                return true;
            }));
        } catch (error) {
            return from([error.error.code == 211]);
        }
    }

    public activate(installation: RxParseInstallation, unique?: boolean): Observable<boolean> {
        if (!installation || installation == null || !installation.objectId || installation.objectId == null) {
            throw new Error('installation can not be a unsaved object.')
        }
        let ch: Observable<boolean>;
        if (unique) {
            this.unset(RxParseUser.installationKey);
            ch = this.save();
        } else {
            ch = from([true]);
        }
        return ch.pipe(flatMap(s1 => {
            let opBody = this.buildRelation('add', [installation]);
            this.set(RxParseUser.installationKey, opBody);
            return this.save();
        }));
    }

    public inactive(installation: RxParseInstallation): Observable<boolean> {
        let opBody = this.buildRelation('remove', [installation]);
        this.set(RxParseUser.installationKey, opBody);
        return this.save();
    }

    public fetchRoles(): Observable<Array<RxParseRole>> {
        let query = new RxParseQuery('_Role');
        query.equalTo('users', this);
        return query.find().pipe(map(roles => {
            let fetched = roles.map(currentItem => {
                let role = RxParseRole.createWithName(currentItem.get('name'), currentItem.objectId);
                return role;
            });
            this.roles = fetched;
            return fetched;
        }));
    }

    public signUp(): Observable<boolean> {
        return RxParseUser.UserController.signUp(this.state, this.estimatedData).pipe(flatMap(userState => {
            return this.handlerSignUp(userState);
        }));
    }

    public static sendSignUpShortCode(mobilePhone: string): Observable<boolean> {
        let data = {
            mobilePhoneNumber: mobilePhone
        };
        return ParseClient.runCommand('/requestSmsCode', 'POST', data).pipe(map(body => {
            return true;
        }));
    }

    public static sendLogInShortCode(mobilePhone: string): Observable<boolean> {
        let data = {
            mobilePhoneNumber: mobilePhone
        };
        return ParseClient.runCommand('/requestLoginSmsCode', 'POST', data).pipe(map(body => {
            return true;
        }));
    }

    public static signUpByMobilePhone(mobilePhone: string, shortCode: string, newUser: RxParseUser): Observable<RxParseUser> {
        let encoded = ParseClientPlugins.instance.Encoder.encode(newUser.estimatedData);
        encoded['mobilePhoneNumber'] = mobilePhone;
        encoded['smsCode'] = shortCode;

        return RxParseUser.UserController.logInWithParameters('/usersByMobilePhone', encoded).pipe(flatMap(userState => {
            let user = RxParseUser.createWithoutData();
            if (userState.isNew)
                return user.handlerSignUp(userState).pipe(map(s => {
                    return user;
                }));
            else {
                return RxParseUser.processLogIn(userState);
            }
        }));
    }

    public static logInByMobilePhone(mobilePhone: string, shortCode: string): Observable<RxParseUser> {
        let data = {
            "mobilePhoneNumber": mobilePhone,
            "smsCode": shortCode
        };
        return RxParseUser.UserController.logInWithParameters('/usersByMobilePhone', data).pipe(flatMap(userState => {
            let user = RxParseUser.createWithoutData();
            if (userState.isNew)
                return user.handlerSignUp(userState).pipe(map(s => {
                    return user;
                }));
            else {
                return RxParseUser.processLogIn(userState);
            }
        }));
    }

    public static logIn(username: string, password: string): Observable<RxParseUser> {
        return RxParseUser.UserController.logIn(username, password).pipe(flatMap(userState => {
            return RxParseUser.processLogIn(userState);
        }));
    }

    public logOut(): Observable<boolean> {
        RxParseUser.usersMap.delete(this.state.app.appId);
        return RxParseObject.saveToLocalStorage(null, `${this.state.app.appId}_${RxParseUser.currentUserCacheKey}`);
    }

    public static logInWithMobilePhone(mobilePhone: string, password: string): Observable<RxParseUser> {
        let data = {
            "mobilePhoneNumber": mobilePhone,
            "password": password
        };
        return RxParseUser.UserController.logInWithParameters('/login', data).pipe(flatMap(userState => {
            return RxParseUser.processLogIn(userState);
        }));
    }

    public create(): Observable<boolean> {
        return RxParseUser.UserController.signUp(this.state, this.estimatedData).pipe(map(userState => {
            super.handlerSave(userState);
            this.state.serverData = userState.serverData;
            return true;
        }));
    }

    public static createWithoutData(objectId?: string) {
        return RxParseObject.createSubclass(RxParseUser, objectId);
    }

    protected static processLogIn(userState: IObjectState): Observable<RxParseUser> {
        let user = RxParseUser.createWithoutData();
        return user.handlerLogIn(userState).pipe(map(s => {
            if (s)
                return user;
            else from([null]);
        }));
    }

    protected handlerLogIn(userState: IObjectState) {
        this.handleFetchResult(userState);
        return RxParseUser.saveCurrentUser(this);
    }

    protected handlerSignUp(userState: IObjectState) {
        this.handlerSave(userState);
        this.state.serverData = userState.serverData;
        this.estimatedData.set('sessionToken', this.sessionToken);
        return RxParseUser.saveCurrentUser(this);
    }
}