import { Observable, Observer, Subject, ConnectableObservable, from } from 'rxjs';
import { HttpRequest } from '../../httpClient/HttpRequest';
import { HttpResponse } from '../../httpClient/HttpResponse';
import { IRxHttpClient } from '../../httpClient/IRxHttpClient';
import { map, catchError, filter } from 'rxjs/operators';
import { IRxWebSocketController } from './IRxWebSocketController';
import { IWebSocketClient } from '../IWebSocketClient';

export class RxWebSocketController implements IRxHttpClient, IRxWebSocketController {

    websocketClient: IWebSocketClient;
    url: string;
    protocols: string | string[];
    onMessage: Observable<any>;
    onState: Observable<number>;
    messageSubject: Subject<any> = new Subject<any>();
    stateSubject: Subject<number> = new Subject<number>();
    publish: ConnectableObservable<any>;
    constructor(_webSocketClient: IWebSocketClient) {
        this.websocketClient = _webSocketClient;
    }
    // private create(): Subject<any> {
    //     // 创建websocket对象
    //     let ws = this.websocketClient;
    //     // 创建Observable对象
    //     let observable = Observable.create(
    //         (obs: Observer<any>) => {
    //             // 当websocket获得推送内容的时候，调用next方法，并传入推送内容
    //             ws.onmessage = obs.next.bind(obs);
    //             // 当websocket出错的时候，调用error方法，并传入失败信息
    //             ws.onerror = obs.error.bind(obs);
    //             // 当websocket关闭的时候，调用complete方法
    //             ws.onclose = obs.complete.bind(obs);
    //             return ws.close.bind(ws);
    //         }
    //     );
    //     // 创建observer对象，用于向websocket发送信息
    //     let observer = {
    //         next: (value) => {
    //             if (ws.readyState === WebSocket.OPEN) {
    //                 ws.send(value.toString());
    //             }
    //         },
    //     };
    //     // 使用Rx.Subject.create 创建 Subject 对象
    //     return Subject.create(observer, observable);
    // } // 获取subject对象接口
    // getSubject() {
    //     if (!this.subject) {
    //         this.subject = this.create();
    //     }
    //     return this.subject;
    // }
    // // 获取publish对象接口
    // getPublish() {
    //     if (!this.publish) {
    //         this.publish = this.getSubject().publish();
    //     }
    //     return this.publish;
    // }
    open(url: string, protocols?: string | string[]): Observable<boolean> {
        if (this.websocketClient.readyState == 1) return from([true]);
        console.log(url, 'connecting...');
        this.url = url;
        this.protocols = protocols;
        this.websocketClient.open(url, protocols);

        this.onState = Observable.create(
            (obs: Observer<number>) => {
                this.websocketClient.onopen = (event) => {
                    console.log(url, 'connected.');
                    obs.next(this.websocketClient.readyState);
                };
                this.websocketClient.onerror = (event) => {
                    obs.next(this.websocketClient.readyState);
                };
                this.websocketClient.onclose = (event) => {
                    obs.next(this.websocketClient.readyState);
                };
            }
        );
        if (this.onState == undefined) {

        }
        if (this.onMessage == undefined) {
            this.websocketClient.onmessage = (event) => {
                console.log('websocket<=', event.data);
                let messageJson = JSON.parse(event.data);
                //console.log('websocket<=', messageJson);
                this.messageSubject.next(event.data);
            };
            this.onMessage = this.messageSubject.asObservable();
            // this.onMessage = Observable.create(
            //     (obs: Observer<string>) => {
            //         console.log('xxxxx', this.onMessage);
            //         this.websocketClient.onmessage = (event) => {
            //             let messageJson = JSON.parse(event.data);
            //             console.log('websocket<=', messageJson);
            //             obs.next(event.data);
            //         };

            //         this.websocketClient.onclose = (event) => {
            //             obs.complete();
            //         };

            //         this.websocketClient.onerror = (event) => {
            //             obs.error(event.stack);
            //         };
            //     }
            // );
            // let observable = Observable.create(
            //     (obs: Observer<string>) => {
            //         this.websocketClient.onmessage = obs.next.bind(str => {
            //             obs.next(str)
            //         });
            //         this.websocketClient.onerror = obs.error.bind(obs);
            //         this.websocketClient.onclose = obs.complete.bind(obs);
            //         return this.websocketClient.close.bind(this.websocketClient);
            //     }
            // );
            // let observer = {
            //     next: (event: any) => {
            //         let messageJson = JSON.parse(event.data);
            //         console.log('websocket<=', messageJson);
            //     },
            // };
            // this.onMessage = Subject.create(observer, observable);
        }

        return this.onState.pipe(filter(readyState => {
            return readyState == 1;
        }), map(readyState => {
            return true;
        }));
    }
    send(data: string | ArrayBuffer | Blob): void {
        this.websocketClient.send(data);
        console.log('websocket=>', data);
    }
    execute(httpRequest: HttpRequest): Observable<HttpResponse> {
        let rawReq = JSON.stringify(httpRequest.data);
        this.send(rawReq);
        return this.onMessage.pipe(filter(message => {
            let messageJSON = JSON.parse(message);
            if (Object.prototype.hasOwnProperty.call(messageJSON, 'i') && Object.prototype.hasOwnProperty.call(httpRequest.data, 'i')) {
                return httpRequest.data.i == messageJSON.i;
            }
            return false;
        }), map(message => {
            let messageJSON = JSON.parse(message);
            let resp = new HttpResponse();
            resp.body = messageJSON;
            resp.statusCode = 200;
            return resp;
        }));
    }
}