import { IObjectState } from '../../object/state/IObjectState';
import { IQueryController } from './IQueryController';
import { ParseCommand } from '../../command/ParseCommand';
import { IParseCommandRunner } from '../../command/IParseCommandRunner';
import { RxParseQuery } from 'public/RxParseQuery';
import { SDKPlugins } from '../../SDKPlugins';
import { Observable, from } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

export class QueryController implements IQueryController {
    private readonly _commandRunner: IParseCommandRunner;

    constructor(commandRunner: IParseCommandRunner) {
        this._commandRunner = commandRunner;
    }

    find(query: RxParseQuery, sessionToken: string): Observable<Array<IObjectState>> {
        let qu = this.buildQueryString(query);
        let cmd = new ParseCommand({
            app: query.app,
            relativeUrl: qu,
            method: 'GET',
            sessionToken: sessionToken
        });
        return this._commandRunner.runRxCommand(cmd).pipe(map(res => {
            let items = res.body["results"] as Array<Object>;
            let x = items.map((item, i, a) => {
                let y = SDKPlugins.instance.ObjectDecoder.decode(item, SDKPlugins.instance.Decoder);
                return y;
            });
            return x;
        }));
    }

    count(query: RxParseQuery, sessionToken: string): Observable<number> {
        return from([0]);
    }

    first(query: RxParseQuery, sessionToken: string): Observable<Array<IObjectState>> {
        return null;
    }

    buildQueryString(query: RxParseQuery) {
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