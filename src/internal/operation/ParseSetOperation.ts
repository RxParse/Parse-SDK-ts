import { IParseFieldOperation } from './IParseFieldOperation';
import { SDKPlugins } from '../ParseClientPlugins';

export class ParseSetOperation implements IParseFieldOperation {
    private value: any;
    constructor(value: any) {
        this.value = value;
    }
    encode(): object {
        return SDKPlugins.instance.Encoder.encode(this.value);
    }
    mergeWithPrevious(previous: IParseFieldOperation): IParseFieldOperation {
        return this;
    }
    apply(oldValue: object, key: string): object {
        return this.value;
    }

}