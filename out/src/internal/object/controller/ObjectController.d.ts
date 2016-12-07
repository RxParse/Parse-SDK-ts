import { IObjectState } from '../state/IObjectState';
import { IObjectController } from './iObjectController';
import { AVCommand } from '../../command/AVCommand';
import { IAVCommandRunner } from '../../command/IAVCommandRunner';
import { Observable } from 'rxjs';
export declare class ObjectController implements IObjectController {
    private readonly _commandRunner;
    constructor(commandRunner: IAVCommandRunner);
    save(state: IObjectState, dictionary: {
        [key: string]: any;
    }, sessionToken: string): Observable<IObjectState>;
    batchSave(states: Array<IObjectState>, dictionaries: Array<{
        [key: string]: any;
    }>, sessionToken: string): Observable<Array<IObjectState>>;
    executeBatchCommands(requests: Array<AVCommand>, sessionToken: string): Observable<{
        [key: string]: any;
    }[]>;
}
