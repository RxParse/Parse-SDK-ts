import * as chai from 'chai';
import * as init from "../utils/init";
import { Observable, timer } from 'rxjs';

describe('rxjs', () => {
    it('timer', done => {
        let count = 0;
        let source = timer(1000, 2000);
        source.subscribe(() => {
            console.log(count);
            if (count == 10) {
                done();
            }
            count++;
        });
    });
});