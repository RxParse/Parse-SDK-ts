import { ILogController } from "./ILogController";
import { of, Observable } from "rxjs";
import { ParseCommand } from '../../command/ParseCommand';
import { ParseCommandResponse } from '../../command/ParseCommandResponse';

export class LogController implements ILogController {
    logOnConsole(message?: any, ...optionalParams: any[]): Observable<boolean> {
        if (optionalParams.length > 0)
            console.log(message, ...optionalParams);
        else console.log(message);
        return of(true);
    }

    log(request: ParseCommand, response: ParseCommandResponse): Observable<boolean> {
        if (request) {
            this.logOnConsole("===HTTP-START===");
            this.logOnConsole("===Request-START===");
            this.logOnConsole("Url: ", request.url);
            this.logOnConsole("Method: ", request.method);
            this.logOnConsole("Headers: ", JSON.stringify(request.headers));
            this.logOnConsole("RequestBody: " + JSON.stringify(request.data));
            this.logOnConsole("===Request-END===");
        }
        if (response) {
            this.logOnConsole("===Response-START===");
            this.logOnConsole("StatusCode: ", response.statusCode);
            this.logOnConsole("ResponseBody: ", JSON.stringify(response.body));
            this.logOnConsole("===Response-END===");
            this.logOnConsole("===HTTP-END===");
        }
        return of(true);
    }

}