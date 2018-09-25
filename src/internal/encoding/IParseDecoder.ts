
export interface IParseDecoder {
    decode(data: { [key: string]: any }): { [key: string]: any };
    decodeItem(data: any): any;
}