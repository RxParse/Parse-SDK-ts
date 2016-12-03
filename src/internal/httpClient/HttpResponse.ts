export /**
 * HttpResponse
 */
    class HttpResponse {
    satusCode: number;
    body: any;
    constructor(option?: [number, any]) {
        if (option != null) {
            this.satusCode = option[0];
            this.body = option[1];
        }
    }
    get jsonBody() {
        return JSON.parse(this.body);
    }
}