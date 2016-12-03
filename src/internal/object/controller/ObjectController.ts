import { IObjectState } from '../state/IObjectState';
import { iObjectController } from './iObjectController';
import { AVCommand } from '../../command/AVCommand';
import { IAVCommandRunner } from '../../command/IAVCommandRunner';
import { SDKPlugins } from '../../SDKPlugins';
import { Observable } from 'rxjs';

export class ObjectController implements iObjectController {
    private readonly _commandRunner: IAVCommandRunner;

    constructor(commandRunner: IAVCommandRunner) {
        this._commandRunner = commandRunner;
    }

    save(state: IObjectState, dictionary: { [key: string]: any }, sessionToken: string): Observable<IObjectState> {

        let encoded = SDKPlugins.instance.Encoder.encode(dictionary);
        let cmd = new AVCommand({
            relativeUrl: "/classes/" + state.className,
            method: 'POST',
            data: encoded
        });

        return this._commandRunner.runRxCommand(cmd).map(res => {
            let serverState = SDKPlugins.instance.ObjectDecoder.decode(res.body,SDKPlugins.instance.Decoder);
            serverState = serverState.mutatedClone(s => {
                s.isNew = res.satusCode == 201;
            });
            return serverState;
        });
    }
}