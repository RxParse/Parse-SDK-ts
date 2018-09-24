import { HttpResponse } from '../httpClient/HttpResponse';

export /**
 * AVCommandResponse
 */
    class AVCommandResponse extends HttpResponse {
    constructor(base: HttpResponse) {
        super();
        this.body = base.body;
        this.statusCode = base.statusCode;
    }
}