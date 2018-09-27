export interface IParseEncoder {
    encode(value: any): any;
    isValidType(value: any): boolean;
}