import { RxAVApp } from '../../../public/RxAVClient';
import { IAVFieldOperation } from '../../operation/IAVFieldOperation';

export interface IObjectState {
    isNew: boolean;
    className: string;
    objectId: string;
    updatedAt: Date;
    createdAt: Date;
    app: RxAVApp;
    serverData: { [key: string]: any };
    currentOperations: { [key: string]: IAVFieldOperation };
    containsKey(key: string): boolean;
    mutatedClone(func: (source: IObjectState) => void): IObjectState;
}