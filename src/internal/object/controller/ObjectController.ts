import { IObjectState } from '../state/IObjectState';
import { IObjectController } from './iObjectController';
import { AVCommand } from '../../command/AVCommand';
import { IAVCommandRunner } from '../../command/IAVCommandRunner';
import { SDKPlugins } from '../../SDKPlugins';
import { Observable } from 'rxjs';

export class ObjectController implements IObjectController {
    private readonly _commandRunner: IAVCommandRunner;

    constructor(commandRunner: IAVCommandRunner) {
        this._commandRunner = commandRunner;
    }

    fetch(state: IObjectState, sessionToken: string): Observable<IObjectState> {
        let cmd = new AVCommand({
            app: state.app,
            relativeUrl: `/classes/${state.className}/${state.objectId}`,
            method: 'GET',
            data: null,
            sessionToken: sessionToken
        });
        return this._commandRunner.runRxCommand(cmd).map(res => {
            let serverState = SDKPlugins.instance.ObjectDecoder.decode(res.body, SDKPlugins.instance.Decoder);
            return serverState;
        });
    }
    clearReadonlyFields(dictionary: { [key: string]: any }) {
        if (Object.prototype.hasOwnProperty.call(dictionary, 'objectId')) {
            delete dictionary['objectId'];
        }
        if (Object.prototype.hasOwnProperty.call(dictionary, 'createdAt')) {
            delete dictionary['createdAt'];
        }
        if (Object.prototype.hasOwnProperty.call(dictionary, 'updatedAt')) {
            delete dictionary['updatedAt'];
        }
    }

    clearRelationFields(dictionary: { [key: string]: any }) {
        for (let key in dictionary) {
            let v = dictionary[key];
            if (Object.prototype.hasOwnProperty.call(v, '__type')) {
                if (v['__type'] == 'Relation') {
                    delete dictionary[key];
                }
            }
        }
    }
    copyToMutable(dictionary: { [key: string]: any }) {
        let newDictionary: { [key: string]: any } = {};
        for (let key in dictionary) {
            newDictionary[key] = dictionary[key];
        }
        return newDictionary;
    }
    packForSave(dictionary: { [key: string]: any }) {
        let mutableDictionary = this.copyToMutable(dictionary);
        this.clearReadonlyFields(mutableDictionary);
        this.clearRelationFields(mutableDictionary);
        return mutableDictionary;
    }

    save(state: IObjectState, dictionary: { [key: string]: any }, sessionToken: string): Observable<IObjectState> {
        let mutableDictionary = this.packForSave(dictionary);
        let encoded = SDKPlugins.instance.Encoder.encode(mutableDictionary);
        let cmd = new AVCommand({
            app: state.app,
            relativeUrl: state.objectId == null ? `/classes/${state.className}` : `/classes/${state.className}/${state.objectId}`,
            method: state.objectId == null ? 'POST' : 'PUT',
            data: encoded,
            sessionToken: sessionToken
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
            let mutableDictionary = this.packForSave(dictionaries[i]);
            let encoded = SDKPlugins.instance.Encoder.encode(mutableDictionary);
            let cmd = new AVCommand({
                app: state.app,
                relativeUrl: state.objectId == null ? `/1.1/classes/${state.className}` : `/1.1/classes/${state.className}/${state.objectId}`,
                method: state.objectId == null ? 'POST' : 'PUT',
                data: encoded,
                sessionToken: sessionToken
            });

            cmdArray.push(cmd);
        });

        return this.executeBatchCommands(cmdArray, sessionToken).map(batchRes => {
            return batchRes.map(res => {
                let serverState = SDKPlugins.instance.ObjectDecoder.decode(res, SDKPlugins.instance.Decoder);
                serverState = serverState.mutatedClone((s: IObjectState) => {
                    s.isNew = res['satusCode'] == 201;
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