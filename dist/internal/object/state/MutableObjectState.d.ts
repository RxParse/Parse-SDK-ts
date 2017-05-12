import { IObjectState } from './IObjectState';
import { RxAVApp } from '../../../public/RxAVClient';
export declare const has: (obj: any, prop: any) => any;
export declare class MutableObjectState implements IObjectState {
    isNew: boolean;
    className: string;
    objectId: string;
    updatedAt: Date;
    createdAt: Date;
    app: RxAVApp;
    serverData: {
        [key: string]: any;
    };
    containsKey(key: string): boolean;
    apply(source: IObjectState): void;
    mutatedClone(func: (source: IObjectState) => void): IObjectState;
    protected mutableClone(): MutableObjectState;
    constructor(options?: any);
}
