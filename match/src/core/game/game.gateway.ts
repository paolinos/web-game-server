/*
import {
    MessageBody,
    OnGatewayConnection,
    OnGatewayDisconnect,
    SubscribeMessage,
    WebSocketGateway,
    WebSocketServer,
    WsResponse,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { User } from '../../models/entities/user';
import { EventEmitter } from 'stream';

// TODO: Refactor this
export enum WS_EVENTS {
	CONNECT="connect",
	DISCONNECT="disconnect",
	READY="ready",
	UPDATE="update",
	END="end"
}

// TODO: Refactor this
export class SocketEvent {
	constructor(
		public readonly eventName:WS_EVENTS,
		public readonly socketId:string,
		public readonly token:string,
		public readonly username:string,
		public readonly data:any=null
	) {}
}

@WebSocketGateway({
    transports: ["websocket"],
    path: '/match-id',
    cors: {
      origin: '*',
    },
})
export class GameGateway implements OnGatewayConnection, OnGatewayDisconnect {
    
    @WebSocketServer()
    server: Server;

	// Relation between socket and user
	private readonly _clients:{ [key: string]: Socket };
	 * We didn't want to make the class EventEmitter. So we have the intenal EventEmitter.
	private readonly _eventEmitter:EventEmitter;

	private authFunct:Function = null;


	constructor(){
		this._clients = {};
		this._eventEmitter = new EventEmitter();
	}

	onWsAuth(callback:(value:string) => boolean) {
		this.authFunct = callback;
	}

	public on(eventName:WS_EVENTS, listener:(e:SocketEvent) => void) {
		this._eventEmitter.on(eventName, listener);
	}
	public off(eventName:WS_EVENTS, listener:(e:SocketEvent) => void) {
		this._eventEmitter.off(eventName, listener);
	}

	 * Emit event to parent class
	 * @param client 
	 * @param eventName 
	private emitEvent(client: Socket, eventName:WS_EVENTS, data:any=null):void {

		// TODO:
		var username = "username " + client.handshake.auth.token;
		this._eventEmitter.emit(eventName, new SocketEvent(eventName, client.id, client.handshake.auth.token, username, data));
	}
	
 
	 * @param users 
	public sendEventToUsers(event:string, users:User[], message:any=null):void
	{
		for (const user of users) {
			const socket = this._clients[user.token];
			if(!socket){
				throw new Error("Trying to send a message to user that not exist. Review this");
			}
			const emited = socket.emit(event, message);
			console.log("Socket:", socket.id, socket.connected, "emited:", emited );
			
			//socket.send(event, message);
		}
	}

	 * Client connected
	 * @param client 
	 * @param args 
	handleConnection(client: Socket, ...args: any[]) {
		// TODO: delete this
		//console.log("GameGateway - client", "headers:", client.handshake.headers, "query:", client.handshake.query, "token:", client.handshake.auth.token);

		//client.emit("events", {"data": "here data from server"})
		// TODO:
		if(this.authFunct && client.handshake.auth){
			console.log("Authentication client socket ...", client.handshake.auth);

			if(this.authFunct(client.handshake.auth.token)){
				
				if(!this._clients[client.handshake.auth.token]){
					this._clients[client.handshake.auth.token] = client;
					
					console.log("SocketClient connected:", client.handshake.auth.token);
					console.log("Client emit test:", client.emit("test-event", "world"));
					
					console.log("Pre-event");
					this.emitEvent(client, WS_EVENTS.CONNECT);
					console.log("Post-event");
				}
				return;
			}
		}

		// Not authenticated user or not allowed will be disconnected
		client.disconnect(true);
	}

	 * client disconnected
	 * @param client 
	handleDisconnect(client: Socket) {
		// TODO: delete this
		//console.log("User disconnected:", client.handshake.headers, "token:", client.handshake.auth.token);
		
		if(this._clients[client.handshake.auth.token]){
			this._clients[client.handshake.auth.token] = null;
			this.emitEvent(client, WS_EVENTS.DISCONNECT);
		}
	}

	
	@SubscribeMessage(WS_EVENTS.READY)
	readyEvent(client: Socket) {
		
		if(this.hasToken(client))
		{
			//console.log("ready - user:", client.handshake.auth.token);
			this.emitEvent(client, WS_EVENTS.READY);
		}
	}


	@SubscribeMessage(WS_EVENTS.UPDATE)
	updateGame(client: Socket) {
		
		
		//if(this.hasToken(client))
		//{
		//	this.emitEvent(client, WS_EVENTS.UPDATE, client.data);
		//}
		

		this.emitEvent(client, WS_EVENTS.UPDATE, client.data);
	}

	@SubscribeMessage(WS_EVENTS.END)
	endGame(client: Socket) {
		this.emitEvent(client, WS_EVENTS.END);
	}

	private hasToken(client: Socket):boolean{
		return client.handshake?.auth?.token;
	}
}
*/