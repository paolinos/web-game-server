import {
    MessageBody,
    OnGatewayConnection,
    OnGatewayDisconnect,
    SubscribeMessage,
    WebSocketGateway,
    WebSocketServer,
    WsResponse,
} from '@nestjs/websockets';
import { from, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Server, Socket } from 'socket.io';
  
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

	/**
	 * Client connected
	 * @param client 
	 * @param args 
	 */
	handleConnection(client: Socket, ...args: any[]) {
		console.log("GameGateway - client", "headers:", client.handshake.headers, "query:", client.handshake.query);

		client.emit("events", {"data": "here data from server"})
	}

	/**
	 * client disconnected
	 * @param client 
	 */
	handleDisconnect(client: Socket) {
		console.log("User disconnected:", client.handshake.headers, client.handshake.query);
	}

	// Examples of event
	
    @SubscribeMessage('events')
    findAll(@MessageBody() data: any): Observable<WsResponse<number>> {
		console.log("SubscribeMessage - events", data);
    	return from([1, 2, 3]).pipe(map(item => ({ event: 'events', data: item })));
    }

    /*
	@SubscribeMessage('events1')
	handleEvent(client: Socket, data: string): string {
		console.log("SubscribeMessage - events1", data);
		return data;
	}

  
    @SubscribeMessage('identity')
    async identity(@MessageBody() data: number): Promise<number> {
		console.log("SubscribeMessage - identity", data);
    	return data;
    }
	*/
}