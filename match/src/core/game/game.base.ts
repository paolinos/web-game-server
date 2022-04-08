import { GameGateway, SocketEvent, WS_EVENTS } from './game.gateway';

export abstract class GameBase {
    constructor(
        protected readonly _ws:GameGateway,
    ){
        this._ws.onWsAuth(this.checkAuth);

        this._ws.on(WS_EVENTS.CONNECT, this.onPlayerConnected.bind(this));
        this._ws.on(WS_EVENTS.DISCONNECT, this.onPlayerDisconnected.bind(this));
        this._ws.on(WS_EVENTS.READY, this.onReady.bind(this));
        this._ws.on(WS_EVENTS.UPDATE, this.onUpdate.bind(this));
        this._ws.on(WS_EVENTS.END, this.onEndGame.bind(this));
    }

    abstract checkAuth(token:string):boolean;

    abstract onPlayerConnected(user:SocketEvent):void;

    abstract onPlayerDisconnected(user:SocketEvent):void;

    abstract onReady(user:SocketEvent):void;

    abstract onUpdate(user:SocketEvent):void;

    abstract onEndGame(e:SocketEvent):void;
}