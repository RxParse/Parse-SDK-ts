import { IAVFieldOperation } from './IAVFieldOperation';
import { SDKPlugins } from '../SDKPlugins';

export class AVDeleteOperation implements IAVFieldOperation {
    encode(): any {
        return {
            __op: 'Delete'
        };
    }
    mergeWithPrevious(previous: IAVFieldOperation): IAVFieldOperation {
        throw new Error("Method not implemented.");
    }
    apply(oldValue: object, key: string): object {
        throw new Error("Method not implemented.");
    }

    constructor() {

    }
}

