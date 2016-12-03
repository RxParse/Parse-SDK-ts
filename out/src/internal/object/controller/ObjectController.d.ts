import { IObjectState } from '../state/IObjectState';
import { iObjectController } from './iObjectController';
import { IAVCommandRunner } from '../../command/IAVCommandRunner';
import { Observable } from 'rxjs';
export declare class ObjectController implements iObjectController {
    private readonly _commandRunner;
    constructor(commandRunner: IAVCommandRunner);
    save(state: IObjectState, dictionary: {
        [key: string]: any;
    }, sessionToken: string): Observable<IObjectState>;
}
