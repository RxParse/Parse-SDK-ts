import { IObjectState } from '../state/IObjectState';
import { IObjectController } from './iObjectController';
import { AVCommand } from '../../command/AVCommand';
import { IAVCommandRunner } from '../../command/IAVCommandRunner';
import { Observable } from 'rxjs';
export declare class ObjectController implements IObjectController {
    private readonly _commandRunner;
    constructor(commandRunner: IAVCommandRunner);
    fetch(state: IObjectState, sessionToken: string): Observable<IObjectState>;
    clearReadonlyFields(dictionary: {
        [key: string]: any;
    }): void;
    clearRelationFields(dictionary: {
        [key: string]: any;
    }): void;
    copyToMutable(dictionary: {
        [key: string]: any;
    }): {
        [key: string]: any;
    };
    packForSave(dictionary: {
        [key: string]: any;
    }): {
        [key: string]: any;
    };
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
