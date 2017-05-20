# rx-lean-js-core - JavaScript SDK in Rx mode for LeanCloud 

```js
let uiList: Array<{ id: string, title: string }> = [];
let query = new RxAVQuery('RxTodo');

query.equalTo('title', '开会');

query.seek().map(obj => {
    return {
        id: obj.objectId,
        title: obj.get('title')
    }
}).subscribe(tupple => {
    uiList.push(tupple);
}, error => { }, () => {

});
```

## 安装

```shell
npm install rx-lean-js-core --save
```

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