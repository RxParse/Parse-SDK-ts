import { Observable } from "rxjs";
import { ParseCommand } from "../../command/ParseCommand";
import { ParseCommandResponse } from "../../command/ParseCommandResponse";

export interface ILogController {
    log(request: ParseCommand, response: ParseCommandResponse): Observable<boolean>;
}