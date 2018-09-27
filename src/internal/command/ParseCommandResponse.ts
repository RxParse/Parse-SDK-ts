import { HttpResponse } from '../httpClient/HttpResponse';

/**
 *
 *
 * @export
 * @class ParseCommandResponse
 * @extends {HttpResponse}
 */
export class ParseCommandResponse extends HttpResponse {
    constructor(base: HttpResponse) {
        super();
        this.body = base.body;
        this.statusCode = base.statusCode;
    }
}