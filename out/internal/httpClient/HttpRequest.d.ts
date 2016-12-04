export declare class HttpRequest {
    url: string;
    headers: {
        [key: string]: string;
    };
    data: {
        [key: string]: any;
    };
    method: string;
    constructor();
}
