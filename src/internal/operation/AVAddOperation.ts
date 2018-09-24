import { IAVFieldOperation } from './IAVFieldOperation';
import { SDKPlugins } from '../SDKPlugins';
import { AVDeleteOperation } from './AVDeleteOperation';
import { AVSetOperation } from './AVSetOperation';

export class AVAddOperation implements IAVFieldOperation {
    encode(): any {
        return {
            __op: 'Add',
            objects: SDKPlugins.instance.Encoder.encode(this.objects)
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
            objects: SDKPlugins.instance.Encoder.encode(this.objects)
        };
    }
    mergeWithPrevious(previous: any): IAVFieldOperation {
        if (previous == null || previous == undefined) {
            return this;
        }
        if (previous instanceof AVDeleteOperation) {
            return new AVSetOperation(this.objects);
        }
        if (previous instanceof AVSetOperation) {
            
        }

        return this;
    }
    apply(oldValue: object, key: string): object {
        throw new Error("Method not implemented.");
    }
    objects: Array<object>;
    constructor(objects: Array<object>) {
        this.objects = objects;
    }
}

