export interface IAVFieldOperation {

    encode(): object;

    mergeWithPrevious(previous: IAVFieldOperation): IAVFieldOperation;

    apply(oldValue: object, key: string): object;
}