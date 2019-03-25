import { IParseFieldOperation } from './IParseFieldOperation';
import { ParseClientPlugins } from '../ParseClientPlugins';
import { ParseDeleteOperation } from './ParseDeleteOperation';
import { ParseSetOperation } from './ParseSetOperation';

export class ParseAddOperation implements IParseFieldOperation {
    encode(): any {
        return {
            __op: 'Add',
            objects: ParseClientPlugins.instance.Encoder.encode(this.objects)
        };
    }
    mergeWithPrevious(previous: IParseFieldOperation): IParseFieldOperation {
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

export class ParseAddUniqueOperation implements IParseFieldOperation {
    encode(): any {
        return {
            __op: 'AddUnique',
            objects: ParseClientPlugins.instance.Encoder.encode(this.objects)
        };
    }
    mergeWithPrevious(previous: any): IParseFieldOperation {
        if (previous == null || previous == undefined) {
            return this;
        }
        if (previous instanceof ParseDeleteOperation) {
            return new ParseSetOperation(this.objects);
        }
        if (previous instanceof ParseSetOperation) {
            
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

