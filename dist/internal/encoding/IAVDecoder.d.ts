export interface IAVDecoder {
    decode(data: {
        [key: string]: any;
    }): {
        [key: string]: any;
    };
    decodeItem(data: any): any;
}
