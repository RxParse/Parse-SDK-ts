import { ParseApp } from '../../../RxParse';

export interface IObjectState {
    isNew: boolean;
    className: string;
    objectId: string;
    updatedAt: Date;
    createdAt: Date;
    app: ParseApp;
    serverData: Map<string, object>;
    containsKey(key: string): boolean;
    mutatedClone(func: (source: IObjectState) => void): IObjectState;
}