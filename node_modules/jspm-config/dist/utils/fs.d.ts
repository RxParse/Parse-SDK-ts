import Promise = require('any-promise');
export declare type ReadFileOp = (path: string, encoding: string) => Promise<string>;
export declare function parseJson(contents: string, path: string, allowEmpty: boolean): any;
export declare function readJson(path: string, allowEmpty?: boolean): Promise<any>;
export declare const readFile: ReadFileOp;
