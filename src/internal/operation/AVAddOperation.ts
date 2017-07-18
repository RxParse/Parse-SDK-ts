import { IAVFieldOperation } from './IAVFieldOperation';
import { SDKPlugins } from '../SDKPlugins';

export class AVAddOperation implements IAVFieldOperation {
    encode(): any {
        return {
            __op: 'Add',
            objects: SDKPlugins.instance.Encoder.encodeList(this.objects)
        };
    }
    mergeWithPrevious(previous: IAVFieldOperation): IAVFieldOperation {
        throw new Error("Method not implemented.");
    }
    apply(oldValue: object, key: string): object {
        throw new Error("Method not implemented.");
    }
    objects: Array<object>;
    constructor(objects: Array<object>) {
        this.objects = objects;
    }
}

export class AVAddUniqueOperation implements IAVFieldOperation {
    encode(): any {
        return {
            __op: 'AddUnique',
            objects: SDKPlugins.instance.Encoder.encodeList(this.objects)
        };
    }
    mergeWithPrevious(previous: IAVFieldOperation): IAVFieldOperation {
        throw new Error("Method not implemented.");
    }
    apply(oldValue: object, key: string): object {
        throw new Error("Method not implemented.");
    }
    objects: Array<object>;
    constructor(objects: Array<object>) {
        this.objects = objects;
    }
}

