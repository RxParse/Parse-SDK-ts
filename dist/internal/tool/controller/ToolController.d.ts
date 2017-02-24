import { IToolController } from './IToolController';
export declare class ToolController implements IToolController {
    randomHexString(size: number): string;
    randomHexStringWithPrefix(prefix: string, size: number): string;
    randomString(size: number): string;
    newObjectId(): string;
    newToken(): string;
    md5Hash(string: string): string;
    newMobilePhoneNumber(): string;
}
