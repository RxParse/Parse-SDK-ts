export interface IParseFieldOperation {

    encode(): object;

    mergeWithPrevious(previous: IParseFieldOperation): IParseFieldOperation;

    apply(oldValue: object, key: string): object;
}