import { IObjectState } from '../../object/state/IObjectState';
import { IQueryController } from './IQueryController';
import { AVCommand } from '../../command/AVCommand';
import { IAVCommandRunner } from '../../command/IAVCommandRunner';
import { RxAVQuery } from '../../../RxLeancloud';
import { SDKPlugins } from '../../SDKPlugins';
import { Observable } from 'rxjs';

export /**
 * QueryController
 */
    class QueryController implements IQueryController {
    private readonly _commandRunner: IAVCommandRunner;

    constructor(commandRunner: IAVCommandRunner) {
        this._commandRunner = commandRunner;
    }

    find(query: RxAVQuery, sessionToken: string): Observable<Array<IObjectState>> {
        let qu = this.buildQueryString(query);
        let cmd = new AVCommand({
            relativeUrl: qu,
            method: 'GET',
            sessionToken: sessionToken
        });
        return this._commandRunner.runRxCommand(cmd).map(res => {
            let items = res.body["results"] as Array<Object>;
            let x = items.map((item, i, a) => {
                let y = SDKPlugins.instance.ObjectDecoder.decode(item, SDKPlugins.instance.Decoder);
                return y;
            });
            return x;
        });
    }

    count(query: RxAVQuery, sesstionToken: string): Observable<number> {
        return Observable.from([0]);
    }

    fitst(query: RxAVQuery, sesstionToken: string): Observable<Array<IObjectState>> {
        return null;
    }

    buildQueryString(query: RxAVQuery) {
        let queryJson = query.buildParameters();
        let queryArray = [];
        let queryUrl = '';
        for (let key in queryJson) {
            let qs = `${key}=${queryJson[key]}`;
            queryArray.push(qs);
        }
        queryUrl = queryArray.join('&');

        return `/classes/${query.className}?${queryUrl}`;
    }
}