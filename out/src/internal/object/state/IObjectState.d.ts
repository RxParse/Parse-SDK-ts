import { RxAVApp } from '../../../public/RxAVClient';
export interface IObjectState {
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
    mutatedClone(func: (source: IObjectState) => void): IObjectState;
}
