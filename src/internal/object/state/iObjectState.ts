export declare interface IObjectState {
    isNew: boolean;
    className: string;
    objectId: string;
    updatedAt: Date;
    createdAt: Date;
    serverData: { [key: string]: any };
    containsKey(key: string): boolean;
    mutatedClone(func: (source: IObjectState) => void): IObjectState;
}
