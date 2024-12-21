import { randomUUID } from "crypto";
import http, { IncomingMessage } from "http";
import iocContainer from "../../ioc";
import internal from "stream";
import { CloseEvent, ErrorEvent, WebSocketServer } from "ws";
import { IOC_TYPES } from "../../ioc.types";
import { IUserBusiness } from "../../core/business/user.business";
import { IMatchMakerBusiness } from "../../core/business/match-maker.business";
import { IGameServerRepository } from "../../infrastructure/db/game-server.repository";

type CustomWsSocket = WebSocket & {
	socketId: string;
};

const upgraderToCustomSocket = (ws: WebSocket): CustomWsSocket => {
	const tmp = ws as CustomWsSocket;
	tmp.socketId = `S|${randomUUID().toString()}`;
	return tmp;
};

class WSManager {
	private static connections: WSClient[] = [];

	static socketConnect(socket: CustomWsSocket): void {
		WSManager.connections.push(new WSClient(socket));
	}

	static socketDisconnect(socket: CustomWsSocket): void {
		const pos = WSManager.connections.findIndex(
			(q) => q.socketId === socket.socketId,
		);
		if (pos >= 0) {
			WSManager.connections.splice(pos, 1);
		}
	}
}

const userBuss = iocContainer.get<IUserBusiness>(IOC_TYPES.UserBusiness);
const matchMakerBusiness = iocContainer.get<IMatchMakerBusiness>(
	IOC_TYPES.MatchMakerBusiness,
);
const gameServerRepository = iocContainer.get<IGameServerRepository>(
	IOC_TYPES.GameServerRepository,
);

class WSClient {
	private _auth?: { email: string; connectionAt: Date };
	constructor(private readonly socket: CustomWsSocket) {
		// NOTE: This event could be not used. At the end we already have the socket opened
		socket.addEventListener("open", this.onSocketOpen.bind(this));
		socket.addEventListener("message", this.onSocketMessage.bind(this));
		// @ts-ignore
		socket.addEventListener("close", this.onSocketCloseEvent.bind(this));
		// @ts-ignore
		socket.addEventListener("error", this.onSocketError.bind(this));

		setTimeout(() => {
			// NOTE: this could be in other functione
			if (!this._auth) {
				socket.close(4001, "User Unauthorized");
			}
		}, 5000);
	}

	get socketId(): string {
		return this.socket.socketId;
	}

	private onSocketOpen(): void {
		console.log("socket opened:", this.socket.socketId);
	}

	private async onSocketMessage(ev: MessageEvent): Promise<void> {
		console.log("socket.socketId:", this.socket.socketId, "message:", ev.data);
		const keyValue = ev.data.split("|");
		if (!this._auth) {
			if (keyValue[0] === "auth") {
				const userData = await userBuss.checkToken(
					this.socket.socketId,
					keyValue[1],
				);

				// TODO: We add a fake game just to test until we have the GameServers working
				if ((await gameServerRepository.getAll()).length === 0) {
					await gameServerRepository.add(
						"01-fake-game-server",
						"tic-tac-toe",
						"0.0.0.0",
						{
							players_required: 2
						}
					);
				}

				if (!(userData instanceof Error)) {
					this._auth = {
						email: userData,
						connectionAt: new Date(),
					};

					this.socket.send("auth:success");

					// TODO: We add a fake game just to test until we have the GameServers working
					const gameList = await gameServerRepository.getAll();
					// TODO: return list of games available
					this.socket.send(
						`games:available|${gameList.map((q) => q.name).join(",")}`,
					);
				} else {
					// TODO: we should clear timeout - REPEATED
					this.socket.close(4001, "User Unauthorized");
				}
			} else {
				console.warn("Auth Error with msg:", ev.data);

				// TODO: we should clear timeout
				this.socket.close(4001, "User Unauthorized");
			}
		} else {
			if (keyValue[0] === "search:match") {
				const errorSearch = await matchMakerBusiness.searchGame(
					this._auth.email,
					keyValue[1],
				);
				if (errorSearch) {
					this.socket.send("error|Invalid game to play");
				}
			}
		}
	}

	private onSocketCloseEvent(ev: CloseEvent): any {
		console.log(
			"socket.socketId:",
			this.socket.socketId,
			"Close socket",
			ev.code,
			ev.reason,
		);
		WSManager.socketDisconnect(this.socket);
	}

	private onSocketError(ev: ErrorEvent): void {
		console.log(
			"socket.socketId:",
			this.socket.socketId,
			"Error",
			ev.error,
			ev.message,
		);
		WSManager.socketDisconnect(this.socket);
	}
}

export const initWebsocket = (server: http.Server) => {
	const wss = new WebSocketServer({ noServer: true });
	// NOTE: this event only have websocket events, HTTP/1.1, Upgrade, Connection, Sec-WebSocket-Accept
	/*wss.on("headers", (headers, request) => {
		console.log("headers:", headers);
	});*/
	// @ts-ignore
	wss.on("connection", (socket: CustomWsSocket, req: IncomingMessage) => {
		// NOTE: here we have all the headers of the Http
		// console.log("User connected", socket.socketId, "headers:", req.headers);
		WSManager.socketConnect(socket);
	});
	wss.on("error", (error: Error) => {
		console.log("WS - error", error);
	});
	wss.on("close", () => {
		console.log("WS - close");
	});

	server.on(
		"upgrade",
		(req: IncomingMessage, socket: internal.Duplex, head: Buffer) => {
			wss.handleUpgrade(
				req,
				socket,
				head,
				// @ts-ignore
				(client: WebSocket, request: IncomingMessage) => {
					const ws = upgraderToCustomSocket(client);
					wss.emit("connection", ws, req);
				},
			);
		},
	);
};
