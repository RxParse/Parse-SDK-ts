import * as chai from 'chai';
import { RxAVClient, RxAVObject, RxAVUser, RxAVACL, RxAVRole, RxAVQuery } from '../../src/RxLeanCloud';

describe('RxObject', function () {
    before(() => {
        RxAVClient.init({
            appId: 'uay57kigwe0b6f5n0e1d4z4xhydsml3dor24bzwvzr57wdap',
            appKey: 'kfgz7jjfsk55r5a8a3y4ttd3je1ko11bkibcikonk32oozww',
            region: 'cn',
            log: true,
            pluginVersion: 2
        });
    });
    it('RxAVObject#saveBase', function (done) {
        let todo: RxAVObject = new RxAVObject('RxTodo');

        todo.set('title', '开会');
        todo.set('time', '2016-12-03');
        todo.set('reminder', new Date());
        todo.set('open', false);

        todo.save().subscribe(() => {
            console.log('todo.title', todo.get('title'));
            done();
        }, error => {
            /** error 的格式如下：
             * {statusCode: -1,error: { code: 0, error: 'Server error' }}
             * statusCode:是本次 http 请求的应答的响应码，LeanCloud 云端会返回标准的 Http Status，一般错误可以从这里查找原因
             * 而具体的逻辑错误可以从 error: { code: 0, error: 'Server error' } 这里来查找，这部分错误在 LeanCloud 官方文档的错误码对照表有详细介绍
             */
            chai.assert.isNull(error);
            if (error.error.code == 1) {
                console.log('1.这个错误是因为 http 请求的 url 拼写有误，一般情况下可能是 class name 不符合规范，请确认');
                console.log('2.还有可能是您错误的使用跨节点的 AppId 调用 API，例如您可能正在使用北美节点上的 AppId 访问大陆的节点，这一点请仔细阅读官方文档');
            }
        });
    });

    it('RxAVObject#saveAll', done => {
        let todo1: RxAVObject = new RxAVObject('RxTodo');
        todo1.set('title', '开会');
        todo1.set('time', '2016-12-03');
        todo1.set('reminder', new Date());

        let todo2: RxAVObject = new RxAVObject('RxTodo');
        todo2.set('title', '开会');
        todo2.set('time', '2016-12-03');
        todo2.set('reminder', new Date());


        let todo3: RxAVObject = new RxAVObject('RxTodo');
        todo3.set('title', '开会');
        todo3.set('time', '2016-12-03');
        todo3.set('reminder', new Date());

        let todo4: RxAVObject = new RxAVObject('RxTodo');
        todo4.set('title', '开会');
        todo4.set('time', '2016-12-03');
        todo4.set('reminder', new Date());

        let obja = [todo1, todo2, todo3, todo4];

        RxAVObject.saveAll(obja).subscribe(next => {
            console.log('1');
        }, error => {
            console.log(error);
        }, () => {
            done();
            console.log('all have been saved.');
        });
    });

    it('RxAVObject#savePointer', done => {
        let todo1: RxAVObject = new RxAVObject('RxTodo');
        todo1.set('title', 'father');
        todo1.set('time', '2016-12-07');
        todo1.set('likes', 9);

        let todo2: RxAVObject = new RxAVObject('RxTodo');
        todo2.set('title', 'son');

        todo1.set('xx', todo2);

        let todo3: RxAVObject = new RxAVObject('RxTodo');
        todo3.set('title', 'grandson');

        todo1.set('yy', todo3);

        todo1.save().subscribe(s => {
            console.log(todo1.objectId);
            console.log(todo2.objectId);
            done();
        }, error => {
            console.log(error);
        });
    });

    it('RxAVObject#saveUnderACL', done => {
        RxAVUser.logIn('junwu', 'leancloud').subscribe(user => {
            let team: RxAVObject = new RxAVObject('teams');

            let teamPrefix = 'hua';
            let admin = `${teamPrefix}_admin`;

            let acl = new RxAVACL();
            acl.setRoleWriteAccess(admin, true);
            acl.setReadAccess(admin, true);
            acl.setPublicWriteAccess(false);
            acl.setPublicReadAccess(false);

            team.set('name', teamPrefix);
            team.set('domain', teamPrefix);
            team.set('owner', RxAVUser.currentUser);

            team.save().subscribe(() => {
                done();
            });
        });
    });

    it('RxAVObject#collectChildrenTwoHierarchies', done => {
        let todo: RxAVObject = new RxAVObject('RxTodo');
        todo.set('title', 'todo');

        let todo2: RxAVObject = new RxAVObject('RxTodo');
        todo2.set('title', 'todo2');

        let todo3: RxAVObject = new RxAVObject('RxTodo');
        todo3.set('title', 'todo3');

        let todo4: RxAVObject = new RxAVObject('RxTodo');
        todo4.set('title', 'todo4');


        let todo5: RxAVObject = new RxAVObject('RxTodo');
        todo5.set('title', 'todo5');

        todo4.set('t', todo5);
        //todo5.set('t', todo4);

        todo.set('t2', todo2);
        todo.set('t3', todo3);
        todo.set('t4', todo4);

        // let x = todo.collectAllLeafNodes();
        // console.log('leafNodes', x);
        // let warehouse: Array<RxAVObject> = [];
        // let s: Array<RxAVObject> = [];
        // let t: Array<RxAVObject> = [];
        // RxAVObject.recursionCollectDirtyChildren(todo, warehouse, s, t);
        // console.log('warehouse', warehouse);
        // console.log('s', s);
        // console.log('t', t);
        // done();

        todo.save().subscribe(s => {
            console.log(s);
            done();
        });
    });
    it('RxAVObject#saveDate', done => {
        let testTodo = new RxAVObject('Todo');
        testTodo.set('rDate', new Date());
        testTodo.save().flatMap(s => {
            let query = new RxAVQuery('Todo');
            query.equalTo('objectId', testTodo.objectId);
            return query.find();
        }).map(todos => {
            let updatedAt = todos[0].updatedAt;
            let testDate = todos[0].get('rDate');
            console.log('testDate', testDate);
            console.log(typeof testDate);
            console.log('ed', todos[0].estimatedData);
            //chai.assert.isTrue(testDate instanceof Date);
            //chai.assert.isTrue(updatedAt instanceof Date);
            //chai.assert.isTrue(testTodo.updatedAt instanceof Date);
            return todos[0];
        }).flatMap(s1 => {
            return s1.save();
        }).subscribe(s2 => {
            chai.assert.isTrue(s2);
            done();
        });
    });

});
