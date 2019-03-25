import { ParseClientPlugins } from '../internal/ParseClientPlugins';
import { RxParseUser } from './RxParseUser';
import { ParseApp } from './ParseApp';
import { IParseCloudController } from '../internal/cloud/controller/IParseCloudController';
import { Observable } from 'rxjs';
import { flatMap } from 'rxjs/operators';
/**
 *
 *
 * @export
 * @class RxParseCloud
 */
export class RxParseCloud {

    /**
     *
     *
     * @readonly
     * @protected
     * @static
     * @type {IParseCloudController}
     * @memberof RxParseCloud
     */
    protected static get LeanEngineController(): IParseCloudController {
        return ParseClientPlugins.instance.cloudController;
    }

    /**
     *
     *
     * @static
     * @param {string} name
     * @param {{ [key: string]: any }} [parameters]
     * @param {ParseApp} [app]
     * @returns
     * @memberof RxParseCloud
     */
    static run(name: string, parameters?: { [key: string]: any }, app?: ParseApp): Observable<{ [key: string]: any }> {
        return RxParseUser.currentSessionToken().pipe(flatMap(sessionToken => {
            return RxParseCloud.LeanEngineController.callFunction(name, parameters, sessionToken);
        }));
    }
}