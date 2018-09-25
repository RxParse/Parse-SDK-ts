import { IParseFieldOperation } from './IParseFieldOperation';
import { SDKPlugins } from '../SDKPlugins';

export class ParseDeleteToken {
    public static sharedInstance = new ParseDeleteToken();
}


export class ParseDeleteOperation implements IParseFieldOperation {
    public static deleteToken = ParseDeleteToken.sharedInstance;
    public static sharedInstance = new ParseDeleteOperation();
    encode(): any {
        return {
            __op: 'Delete'
        };
    }
    mergeWithPrevious(previous: IParseFieldOperation): IParseFieldOperation {
        return this;
    }
    apply(oldValue: object, key: string): object {
        return ParseDeleteOperation.deleteToken;
    }

    constructor() {

    }
}

