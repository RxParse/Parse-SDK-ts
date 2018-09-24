export interface IAVEncoder {
    encode(value: any): any;
    isValidType(value: any): boolean;
}