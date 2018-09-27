import * as chai from 'chai';
import * as init from "../utils/init";
import { Observable, merge } from 'rxjs';
import { ParseClient, RxParseObject, RxParseUser, RxParseACL, RxParseRole, RxParseQuery, ParseApp } from '../../src/RxParse';

let app = new ParseApp({
    appId: `parse`,
    serverURL: 'https://chigua.live/api',
    additionalHeaders: {
        'X-Parse-Application-Id': `parse`
    }
});

describe('RxObject', function () {
    before(() => {

    });

    it('Client#saveToMultipleApps', done => {
        let todo1: RxParseObject = new RxParseObject('RxTodo');
        todo1.set('app', 'app1');

        let todo2: RxParseObject = new RxParseObject('RxTodo', { appName: 'dev' });
        todo2.set('app', 'app2');

        let todo3: RxParseObject = new RxParseObject('RxTodo', { appName: 'default' });
        todo2.set('app', 'app1');

        merge(todo1.save(), todo2.save(), todo3.save()).subscribe(s => {
            console.log('Next: ' + s);
        }, error => { }, () => {
            done();
        });
    });
    it('Client#initWithoutConfig', done => {
        ParseClient.init().add(app);
        done();
    });
});