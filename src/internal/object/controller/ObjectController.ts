import { IObjectState } from '../state/IObjectState';
import { IObjectController } from './iObjectController';
import { AVCommand } from '../../command/AVCommand';
import { IAVCommandRunner } from '../../command/IAVCommandRunner';
import { SDKPlugins } from '../../SDKPlugins';
import { Observable } from '@reactivex/rxjs';

export class ObjectController implements IObjectController {
    private readonly _commandRunner: IAVCommandRunner;

    constructor(commandRunner: IAVCommandRunner) {
        this._commandRunner = commandRunner;
    }

    save(state: IObjectState, dictionary: { [key: string]: any }, sessionToken: string): Observable<IObjectState> {
        let encoded = SDKPlugins.instance.Encoder.encode(dictionary);

        let cmd = new AVCommand({
            relativeUrl: state.objectId == null ? `/classes/${state.className}` : `/classes/${state.className}/${state.objectId}`,
            method: state.objectId == null ? 'POST' : 'PUT',
            data: encoded
        });

        return this._commandRunner.runRxCommand(cmd).map(res => {
            let serverState = SDKPlugins.instance.ObjectDecoder.decode(res.body, SDKPlugins.instance.Decoder);
            serverState = serverState.mutatedClone((s: IObjectState) => {
                s.isNew = res.satusCode == 201;
            });
            return serverState;
        });
    }

    batchSave(states: Array<IObjectState>, dictionaries: Array<{ [key: string]: any }>, sessionToken: string): Observable<Array<IObjectState>> {

        let cmdArray: Array<AVCommand> = [];

        states.map((state, i, a) => {
            let encoded = SDKPlugins.instance.Encoder.encode(dictionaries[i]);
            let cmd = new AVCommand({
                relativeUrl: state.objectId == null ? `/1.1/classes/${state.className}` : `/1.1/classes/${state.className}/${state.objectId}`,
                method: state.objectId == null ? 'POST' : 'PUT',
                data: encoded
            });

            cmdArray.push(cmd);
        });

        return this.executeBatchCommands(cmdArray, sessionToken).map(batchRes => {
            return batchRes.map(res => {
                let serverState = SDKPlugins.instance.ObjectDecoder.decode(res, SDKPlugins.instance.Decoder);
                serverState = serverState.mutatedClone((s: IObjectState) => {
                });
                return serverState;
            });
        });

    }
    executeBatchCommands(requests: Array<AVCommand>, sessionToken: string) {
        let rtn: Array<{ [key: string]: any }> = [];
        let batchSize = requests.length;
        let encodedRequests = requests.map((cmd, i, a) => {
            let r: { [key: string]: any } = {
                method: cmd.method,
                path: cmd.relativeUrl
            };
            if (cmd.data != null) {
                r['body'] = cmd.data;
            }
            return r;
        });

        let batchRequest = new AVCommand({
            relativeUrl: '/batch',
            method: 'POST',
            data: { requests: encodedRequests }
        });
        return this._commandRunner.runRxCommand(batchRequest).map(res => {
            let resultsArray = res.body;
            let resultLength = resultsArray.length;
            if (resultLength != batchSize) {
                throw new Error(`Batch command result count expected: " + ${batchSize} + " but was: " + ${resultLength} + ".`)
            }
            for (let i = 0; i < batchSize; i++) {
                let result = resultsArray[i];
                if (Object.prototype.hasOwnProperty.call(result, 'success')) {
                    let subBody = result.success;
                    rtn.push(subBody);
                }
            }

            return rtn;
        });
    }
}