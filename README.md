# LeanCloud TypeScript SDK  - 一门语言，一个框架，Web & Mobile 一起开发


## 安装

```shell
npm install leancloud-typescript-rx-sdk --save
```

## API Doc

[LeanCloud TypeScript SDK API Doc](https://wujun4code.github.io/leancloud-typescript-rx-sdk/docs/gen/index.html)

## 研发计划 - Roadmap

### 目前支持的模块 - Available

- [x] 数据存储(RxAVObject)
- [x] 数据查询(RxAVQuery)
- [x] 云引擎函数(RxLeanEngine)
- [x] ACL(RxAVRole & RxAVACL)
- [x] 短信(注册和登陆)
- [x] 统计分析(RxAVAnalytics)
- [x] 推送(RxAVPush)
- [x] 聊天 (RxRealtime)
- [x] LiveQuery(RxLiveQuery)
- [x] 客户端多 App 实例切换(RxAVApp)

### 已在计划内 - In plan

- [ ] nodejs (express 等服务端组件)
- [ ] React 
- [ ] vue
- [ ] React Native

### 不在计划内 - Not in plan
- 文件功能(上传和下载)

## 技术栈 - Technology stack
### 为什么选择 TypeScript 开发-  Why TypeScript?

> Because Google choose it,and Microsoft made it.

### 为什么异步模型选择了 RxJavaScript 而不是亲儿子 Promise？- Why RxJS？

因为 RxJS 可以很好解决异步和事件组合的问题。大多数 BaaS 或者 PaaS 的使用者都是倾向于服务端是一个所见即所用的东西（正如 LeanCloud 这些年以来一直致力于实现的目标一样），
因此大多数用户都是客户端编程经验丰富，而经验丰富的客户端工程师对于异步和事件都不会陌生，而在 Rx 的编程理念中，致力于在这两者事件找到一种结合：

- 异步：await Task  = Observable.subscribe
- 事件: event.emit  = Observable.subscribe

也就是不管是主动和被动的行为都视为我作为一个客户端订阅了这两种行为的结果，这就是两者的共同点。

对于习惯了 Rx 的开发模之后，对客户端工程师来说很容易「深陷其中」。

正如下面的实例代码，向 LeanCloud 云端保存一个对象：

```ts
    let todo: RxAVObject = new RxAVObject('RxTodo');
    todo.set('title', '开会');
    todo.set('time', '2016-12-03');
    todo.set('reminder', new Date());
    todo.save().subscribe(success => {
        if (success) console.log(todo.objectId);
    });
```

## 哪些时候可以使用  - Where to use?

### Web 
在 Angular2 以及 Ionic2 中均可使用，而这恰好是这个 SDK 存在的理由。

假设你要开发一个小的 Web 前端项目，你完全可以不花一毛钱租服务器，食用

> LeanEngine + Angular2 + LeanCloud TypeScript SDK

这个套餐就可以开发一个不简单的项目了。

### Mobile
假设你要开发一个移动 App，你想做全平台 iOS & Android，你就可以使用 Ionic2 做为你迭代的第一个版本的选择，因为 Ionic2 = Angular2 + Cordova，实际上你就是在开发一个 Web 项目。
