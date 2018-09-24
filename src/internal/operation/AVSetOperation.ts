import { IAVFieldOperation } from './IAVFieldOperation';
import { SDKPlugins } from '../SDKPlugins';

export class AVSetOperation implements IAVFieldOperation {
    private value: any;
    constructor(value: any) {
        this.value = value;
    }
    encode(): object {
        return SDKPlugins.instance.Encoder.encode(this.value);
    }
    mergeWithPrevious(previous: IAVFieldOperation): IAVFieldOperation {
        return this;
    }
    apply(oldValue: object, key: string): object {
        return this.value;
    }

}