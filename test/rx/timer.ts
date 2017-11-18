import * as chai from 'chai';
import * as init from "../utils/init";
import { Observable } from 'rxjs';

describe('rxjs', () => {
    it('timer', done => {
        let count = 0;
        let source = Observable.timer(1000, 2000);
        source.subscribe(() => {
            console.log(count);
            if (count == 10) {
                done();
            }
            count++;
        });
    });
});