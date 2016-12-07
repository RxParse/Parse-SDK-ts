## Rx is great,Typescript is wonderful, Angular2 is awesome!

开发目的：Typescript 跟 C# 一样可爱，Rx 思想一旦接受，就等同于中毒。


## 目前支持的模块

- [x] Object#save
- [x] Object.saveAll
- [x] User#signUp
- [x] Query#equalTo
- [x] Query#notEqualTo
- [x] Query#lessThan
- [x] Query#greaterlTo
- [x] Query#descending
- [x] Query#ascending
- [x] LeanEngine#callFunction

## 未来肯定支持的模块
- [ ] ACL
- [ ] 短信
- [ ] Ionic2 本地存储适配
- [ ] Angular 本地存储适配

## 未来未必支持的模块
- [ ] Push
- [ ] File
- [ ] Analytic

## 未来说不定就有的模块
- [ ] 聊天


### 性感的订阅语法

```ts
let todo: RxAVObject = new RxAVObject('RxTodo');
todo.set('title', '开会');
todo.set('time', '2016-12-03');
todo.set('reminder', new Date());
todo.save().subscribe(success => {
    if (success) console.log(todo.objectId);
});
```

强类型对代码阅读者是友好的，一个程序员首先得对自己好，才会去对别人好。😝


