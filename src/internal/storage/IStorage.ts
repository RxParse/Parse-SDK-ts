
export interface IStorage {
    add(key: string, value: any): Promise<any>
    remove(key: string):  Promise<boolean>;
    get(key: string): Promise<string>;
}

export interface RealtimeStorage{

}