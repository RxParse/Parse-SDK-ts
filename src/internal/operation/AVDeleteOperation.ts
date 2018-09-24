import { IAVFieldOperation } from './IAVFieldOperation';
import { SDKPlugins } from '../SDKPlugins';

export class AVDeleteToken {
    public static sharedInstance = new AVDeleteToken();
}


export class AVDeleteOperation implements IAVFieldOperation {
    public static deleteToken = AVDeleteToken.sharedInstance;
    public static sharedInstance = new AVDeleteOperation();
    encode(): any {
        return {
            __op: 'Delete'
        };
    }
    mergeWithPrevious(previous: IAVFieldOperation): IAVFieldOperation {
        return this;
    }
    apply(oldValue: object, key: string): object {
        return AVDeleteOperation.deleteToken;
    }

    constructor() {

    }
}

