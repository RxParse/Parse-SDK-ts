export interface IAVEncoder {
    encode(dictionary: { [key: string]: any }): { [key: string]: any };
    encodeList(list: Array<any>): Array<any>;
    encodeItem(item: any): any;
}