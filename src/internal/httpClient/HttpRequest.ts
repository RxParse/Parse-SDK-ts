
export class HttpRequest {
    public url: string;
    public headers: { [key: string]: string };
    public data: { [key: string]: any };
    public method: string;

    constructor() { };
}
