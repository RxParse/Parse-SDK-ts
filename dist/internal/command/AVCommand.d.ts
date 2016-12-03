import { HttpRequest } from '../httpClient/HttpRequest';
export declare class AVCommand extends HttpRequest {
    relativeUrl: string;
    sessionToken: string;
    contentType: string;
    constructor(options?: any);
}
