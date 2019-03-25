import { IParseFieldOperation } from './IParseFieldOperation';
import { ParseClientPlugins } from '../ParseClientPlugins';

export class ParseSetOperation implements IParseFieldOperation {
    private value: any;
    constructor(value: any) {
        this.value = value;
    }
    encode(): object {
        return ParseClientPlugins.instance.Encoder.encode(this.value);
    }
    mergeWithPrevious(previous: IParseFieldOperation): IParseFieldOperation {
        return this;
    }
    apply(oldValue: object, key: string): object {
        return this.value;
    }

}