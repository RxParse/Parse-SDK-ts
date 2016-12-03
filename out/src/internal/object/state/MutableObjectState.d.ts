/// <reference types="core-js" />
import { IObjectState } from './IObjectState';
export declare const has: (obj: any, prop: any) => any;
export declare class MutableObjectState implements IObjectState {
    isNew: boolean;
    className: string;
    objectId: string;
    updatedAt: Date;
    createdAt: Date;
    serverData: {
        [key: string]: any;
    };
    containsKey(key: string): boolean;
    apply(source: IObjectState): void;
    mutatedClone(func: (source: IObjectState) => void): IObjectState;
    protected mutableClone(): MutableObjectState;
    constructor(options?: any);
}
