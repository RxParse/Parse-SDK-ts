import { IParseCloudController } from './IParseCloudController'
import { Observable } from 'rxjs';
import { ParseCommand } from '../../command/ParseCommand';
import { SDKPlugins } from '../../SDKPlugins';
import { IParseCloudDecoder } from '../encoding/IParseCloudDecoder';

export class ParseCloudController implements IParseCloudController {
    private _LeanEngineDecoder: IParseCloudDecoder;

    constructor(LeanEngineDecoder: IParseCloudDecoder) {
        this._LeanEngineDecoder = LeanEngineDecoder;
    }

    callFunction(name: string,
        parameters?: { [key: string]: any },
        sessionToken?: string): Observable<{ [key: string]: any }> {

        let cmd = new ParseCommand({
            relativeUrl: `/functions/${name}`,
            method: 'POST',
            data: parameters,
            sessionToken: sessionToken
        });

        return SDKPlugins.instance.commandRunner.runRxCommand(cmd).map(res => {
            let result = this._LeanEngineDecoder.decodeDictionary(res.body.result);
            return result;
        });
    }
}