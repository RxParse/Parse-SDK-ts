import { BaseError } from 'make-error-cause';
export declare class ConfigError extends BaseError {
}
export declare class ModuleNotFoundError extends BaseError {
    constructor(moduleName: string);
}
