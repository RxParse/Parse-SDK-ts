export /**
 * HttpResponse
 */
    class HttpResponse {
    statusCode: number;
    body: any;
    constructor(option?: [number, any]) {
        if (option != null) {
            this.statusCode = option[0];
            this.body = option[1];
        }
    }
    get jsonBody() {
        return JSON.parse(this.body);
    }
}