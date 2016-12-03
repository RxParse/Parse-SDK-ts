## Rx is great,Typescript is wonderful！

开发目的：Typescript 跟 C# 一样可爱，Rx 思想一旦接受，就等同于中毒。


## 目前支持的模块

- [x] Object#save
- [x] User#signUp

### 性感的语法

```ts
let todo: RxAVObject = new RxAVObject('RxTodo');
todo.set('title', '开会');
todo.set('time', '2016-12-03');
todo.set('rd', new Date());
todo.save().subscribe(success => {
    if (success) console.log(todo.objectId);
});
```

强类型对代码阅读者是友好的，一个程序员首先得对自己好，才会去对别人好。😝


